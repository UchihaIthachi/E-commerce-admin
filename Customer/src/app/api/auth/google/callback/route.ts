import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import jwt from 'jsonwebtoken'; // For our app's tokens
import { OAuth2Client } from 'google-auth-library';
import { serialize, parse } from 'cookie'; // For setting our app's cookies
import bcrypt from 'bcryptjs';
import { Role } // Assuming Role enum is available from Prisma client

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Helper function to generate application tokens and set cookies (similar to credentials login)
async function setAppCookiesAndSession(user: { id: string; email: string | null; role: Role }, response: NextResponse) {
  // This function creates app-specific access and refresh tokens after successful Google authentication.
  // It also creates a session in the database, storing a hashed version of the app's refresh token.
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

  // Hash the application's refresh token before storing it in the database.
  // This is a security measure to protect the raw token even if the database is compromised.
  const hashedAppRefreshToken = await bcrypt.hash(appRefreshToken, 10);
  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: hashedAppRefreshToken, // Store the hashed version of the app refresh token
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

  // CSRF Protection: Retrieve the 'state' parameter from Google's callback URL.
  const callbackState = url.searchParams.get('state');

  // CSRF Protection: Retrieve the 'state' value stored in the 'google_oauth_state' cookie.
  const cookieHeader = request.headers.get('cookie');
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const storedState = cookies.google_oauth_state;

  // CSRF Protection: Prepare to clear the 'google_oauth_state' cookie.
  // This cookie is single-use and should be cleared regardless of success or failure.
  const clearStateCookie = serialize('google_oauth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google', // Must match the path used when setting the cookie
    expires: new Date(0), // Expire immediately to remove it
  });

  // CSRF Protection: Validate the state parameter.
  // This ensures the OAuth flow was initiated by this application and not an attacker.
  if (!callbackState || !storedState || callbackState !== storedState) {
    console.error('Invalid OAuth state:', { callbackState, storedState });
    const errorRedirectUrl = new URL(`${NEXT_PUBLIC_APP_URL}/auth/error?error=InvalidStateParameter`);
    const errorResponse = NextResponse.redirect(errorRedirectUrl.toString(), { status: 302 });
    errorResponse.headers.append('Set-Cookie', clearStateCookie);
    return errorResponse;
  }

  // State is valid, proceed
  if (!code) {
    // This error case should also clear the state cookie
    const errorResponse = NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=MissingAuthorizationCode`, { status: 302 });
    errorResponse.headers.append('Set-Cookie', clearStateCookie);
    return errorResponse;
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXT_PUBLIC_APP_URL || !JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    console.error('Google OAuth or JWT configuration is missing.');
    // This error case should also clear the state cookie
    const errorResponse = NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=ServerConfigurationError`, { status: 302 });
    errorResponse.headers.append('Set-Cookie', clearStateCookie);
    return errorResponse;
  }

  const redirectUri = `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
  // The OAuth2Client from 'google-auth-library' is used to interact with Google's OAuth2 services.
  // It's configured with the Google Client ID.
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);

  try {
    // 1. Token Exchange: Exchange the authorization code for Google's access and ID tokens.
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
      const errorResponse = NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=TokenExchangeFailed`, { status: 302 });
      errorResponse.headers.append('Set-Cookie', clearStateCookie);
      return errorResponse;
    }

    const googleTokens = await tokenResponse.json() as GoogleTokenResponse;

    // 2. Verify ID Token: Use 'google-auth-library' to verify the signature and claims of the ID token.
    // This is a critical security step to ensure the token is authentic, issued by Google,
    // intended for this application (audience check), and not expired.
    // The library handles fetching Google's public keys for signature verification.
    const ticket = await client.verifyIdToken({
      idToken: googleTokens.id_token, // The ID token received from Google
      audience: GOOGLE_CLIENT_ID,     // The application's Google Client ID
    });
    const idTokenPayload = ticket.getPayload(); // Contains verified claims like sub, email, name, etc.

    // Ensure the payload was successfully retrieved and contains essential user identifiers.
    if (!idTokenPayload || !idTokenPayload.sub || !idTokenPayload.email) {
      console.error('Failed to verify ID token or missing essential claims from payload.');
      const errorResponse = NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/auth/error?error=InvalidIdToken`, { status: 302 });
      errorResponse.headers.append('Set-Cookie', clearStateCookie);
      return errorResponse;
    }

    // Note: `client.verifyIdToken` automatically checks critical claims:
    // - 'aud' (audience): Matches GOOGLE_CLIENT_ID.
    // - 'iss' (issuer): Is 'https://accounts.google.com' or 'accounts.google.com'.
    // - 'exp' (expiration time): Token is not expired.
    // - 'iat' (issued at time): Token is not used before it's valid.
    // Therefore, manual checks for these claims are no longer necessary.

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
    await setAppCookiesAndSession(appUser, response); // This function now handles hashing the app refresh token
    // Ensure the CSRF state cookie is cleared on successful authentication path
    response.headers.append('Set-Cookie', clearStateCookie);

    return response;

  } catch (error) {
    console.error('Google callback error:', error);
    const redirectUrl = new URL(`${NEXT_PUBLIC_APP_URL}/auth/error`);
    if (error instanceof Error) {
        redirectUrl.searchParams.set('error', error.message);
    } else {
        redirectUrl.searchParams.set('error', 'UnknownError');
    }
    const errorResponse = NextResponse.redirect(redirectUrl.toString(), { status: 302 });
    errorResponse.headers.append('Set-Cookie', clearStateCookie);
    return errorResponse;
  }
}
