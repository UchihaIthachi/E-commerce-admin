import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import crypto from 'crypto';
import { log } from '@/server/application/common/services/logging';

export async function GET(request: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!googleClientId || !nextPublicAppUrl) {
    log('SEVERE', 'Google OAuth configuration (GOOGLE_CLIENT_ID or NEXT_PUBLIC_APP_URL) is missing in environment variables.');
    return NextResponse.json({ error: 'Server configuration error for Google OAuth.' }, { status: 500 });
  }

  const redirectUri = `${nextPublicAppUrl}/api/auth/google/callback`;

  const state = crypto.randomBytes(32).toString('hex');
  const stateCookie = serialize('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 'lax' is generally recommended for OAuth state cookies
    path: '/api/auth/google', // Be specific to the callback path vicinity
    maxAge: 60 * 15, // 15 minutes validity for the state cookie
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: googleClientId,
    redirect_uri: redirectUri,
    scope: 'openid email profile', // Standard scopes for basic user info
    // access_type: 'offline', // Uncomment if you need Google's refresh token
    // prompt: 'consent', // Optional: forces consent screen every time, useful for dev
    state: state, // Add the state parameter
  });

  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  log('INFO', `Redirecting to Google OAuth for client: ${request.ip || 'unknown'}`);
  // Redirect the user to Google's OAuth consent screen
  const response = NextResponse.redirect(googleOAuthUrl, 302);
  response.headers.set('Set-Cookie', stateCookie);
  return response;
}
