import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import jwt from 'jsonwebtoken'; // For our app's tokens
import { serialize } from 'cookie'; // For setting our app's cookies
import { Role } // Assuming Role enum is available from Prisma client

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Helper function to generate application tokens and set cookies (similar to credentials login)
async function setAppCookiesAndSession(user: { id: string; email: string | null; role: Role }, response: NextResponse) {
  if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('App JWT secrets are not defined.');
  }

  const appAccessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m' }
  );

  const appRefreshToken = jwt.sign(
    { userId: user.id, email: user.email }, // Refresh token might have less info
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );

  const sessionExpiresIn = Date.now() + (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MS ? parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MS) : 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: appRefreshToken, // Storing the raw refresh token
      expires: new Date(sessionExpiresIn),
    },
  });

  response.headers.append('Set-Cookie', serialize('access_token', appAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: (process.env.JWT_ACCESS_TOKEN_MAX_AGE ? parseInt(process.env.JWT_ACCESS_TOKEN_MAX_AGE) : 15 * 60)
  }));
  response.headers.append('Set-Cookie', serialize('refresh_token', appRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: (process.env.JWT_REFRESH_TOKEN_MAX_AGE ? parseInt(process.env.JWT_REFRESH_TOKEN_MAX_AGE) : 7 * 24 * 60 * 60)
  }));
}


interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token?: string; // Only if access_type=offline
  scope: string;
  token_type: string;
}

interface GoogleIdTokenPayload {
  iss: string; // Issuer
  azp: string; // Authorized party (client ID)
  aud: string; // Audience (client ID)
  sub: string; // Subject (Google User ID)
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat: number; // Issued at
  exp: number; // Expires at
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  // const state = url.searchParams.get('state'); // TODO: Implement CSRF protection with state

  if (!code) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=MissingAuthorizationCode`, { status: 302 });
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXT_PUBLIC_APP_URL || !JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    console.error('Google OAuth or JWT configuration is missing.');
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=ServerConfigurationError`, { status: 302 });
  }

  const redirectUri = `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  try {
    // 1. Token Exchange
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json();
      console.error('Google token exchange failed:', errorBody);
      return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=TokenExchangeFailed`, { status: 302 });
    }

    const googleTokens = await tokenResponse.json() as GoogleTokenResponse;

    // 2. Decode ID Token to get user info (basic, without full signature verification here)
    // For production, MUST verify the id_token signature using google-auth-library or fetching Google's public keys.
    // Here, we are trusting the token received directly from Google over HTTPS.
    const idTokenPayload = jwt.decode(googleTokens.id_token) as GoogleIdTokenPayload;

    if (!idTokenPayload || !idTokenPayload.sub || !idTokenPayload.email) {
      console.error('Failed to decode ID token or missing essential claims.');
      return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=InvalidIdToken`, { status: 302 });
    }

    // Verify audience claim (aud) matches your GOOGLE_CLIENT_ID
    if (idTokenPayload.aud !== GOOGLE_CLIENT_ID) {
        console.error('ID token audience mismatch.');
        return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=TokenAudienceMismatch`, { status: 302 });
    }

    // Verify issuer claim (iss)
    if (idTokenPayload.iss !== 'https://accounts.google.com' && idTokenPayload.iss !== 'accounts.google.com') {
        console.error('ID token issuer mismatch.');
        return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=TokenIssuerMismatch`, { status: 302 });
    }


    const googleUserId = idTokenPayload.sub;
    const userEmail = idTokenPayload.email;
    const userName = idTokenPayload.name || idTokenPayload.given_name;
    const userPicture = idTokenPayload.picture;

    // 3. Database Interaction
    let appUser; // This will be our application's User model instance

    // Check if an account with this Google ID already exists
    const existingAccount = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: 'google', providerAccountId: googleUserId } },
      include: { user: true },
    });

    if (existingAccount) {
      appUser = existingAccount.user;
    } else {
      // New Google login. Check if user with this email already exists.
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (existingUserByEmail) {
        // User with this email exists. Link Google account to this user.
        appUser = existingUserByEmail;
        await prisma.account.create({
          data: {
            userId: appUser.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleUserId,
            access_token: googleTokens.access_token, // Store Google's tokens if needed later
            id_token: googleTokens.id_token,
            refresh_token: googleTokens.refresh_token, // If requested and provided
            // expires_at for Google's access_token could be stored too
          },
        });
      } else {
        // Completely new user. Create User and Account.
        appUser = await prisma.user.create({
          data: {
            email: userEmail,
            name: userName,
            image: userPicture,
            emailVerified: new Date(), // Email is verified by Google
            role: Role.CUSTOMER, // Default role
            accounts: {
              create: {
                type: 'oauth',
                provider: 'google',
                providerAccountId: googleUserId,
                access_token: googleTokens.access_token,
                id_token: googleTokens.id_token,
                refresh_token: googleTokens.refresh_token,
              },
            },
          },
        });
      }
    }

    // 4. Generate application tokens, create session, set cookies
    const response = NextResponse.redirect(NEXT_PUBLIC_APP_URL || '/', { status: 302 }); // Redirect to home or dashboard
    await setAppCookiesAndSession(appUser, response);

    return response;

  } catch (error) {
    console.error('Google callback error:', error);
    const redirectUrl = new URL(`${NEXT_PUBLIC_APP_URL}/auth/error`);
    if (error instanceof Error) {
        redirectUrl.searchParams.set('error', error.message);
    } else {
        redirectUrl.searchParams.set('error', 'UnknownError');
    }
    return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
  }
}
