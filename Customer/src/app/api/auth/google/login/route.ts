import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!googleClientId || !nextPublicAppUrl) {
    console.error('Google OAuth configuration is missing in environment variables.');
    return NextResponse.json({ error: 'Server configuration error for Google OAuth.' }, { status: 500 });
  }

  const redirectUri = `${nextPublicAppUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: googleClientId,
    redirect_uri: redirectUri,
    scope: 'openid email profile', // Standard scopes for basic user info
    // access_type: 'offline', // Uncomment if you need Google's refresh token
    // prompt: 'consent', // Optional: forces consent screen every time, useful for dev
    // state: 'your_random_state_string', // Optional: for CSRF protection
  });

  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // Redirect the user to Google's OAuth consent screen
  return NextResponse.redirect(googleOAuthUrl, 302);
}
