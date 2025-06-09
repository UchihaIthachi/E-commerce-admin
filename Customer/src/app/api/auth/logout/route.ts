import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import { serialize, parse } from 'cookie';

export async function POST(request: NextRequest) {
  try {
    // 1. Extract refresh token from HTTPOnly cookie
    const cookieHeader = request.headers.get('cookie');
    let refreshTokenFromCookie;

    if (cookieHeader) {
      const cookies = parse(cookieHeader);
      refreshTokenFromCookie = cookies.refresh_token;
    }

    // 2. If refresh token exists, invalidate it in the database
    if (refreshTokenFromCookie) {
      // Find the session by the refresh token.
      // Note: If refresh tokens are hashed in the DB, this lookup would need to change.
      // Currently, we store the raw JWT refresh token as the sessionToken.
      const session = await prisma.session.findUnique({
        where: { sessionToken: refreshTokenFromCookie },
      });

      if (session) {
        await prisma.session.delete({
          where: { id: session.id },
        });
      }
      // If no session is found for the token, it might have already been invalidated
      // or the cookie contains an old/invalid token. Proceed to clear cookies.
    }

    // 3. Clear access token and refresh token cookies
    const accessTokenClearCookie = serialize('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // Expire immediately
    });

    const refreshTokenClearCookie = serialize('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth', // Ensure path matches where it was set
      expires: new Date(0), // Expire immediately
    });

    const headers = new Headers();
    headers.append('Set-Cookie', accessTokenClearCookie);
    headers.append('Set-Cookie', refreshTokenClearCookie);

    // 4. Return success response
    return NextResponse.json({ message: 'Logout successful' }, { status: 200, headers });

  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, attempt to clear cookies as a safety measure
    const accessTokenClearCookie = serialize('access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
      });

      const refreshTokenClearCookie = serialize('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        expires: new Date(0),
      });

      const headers = new Headers();
      headers.append('Set-Cookie', accessTokenClearCookie);
      headers.append('Set-Cookie', refreshTokenClearCookie);

    return NextResponse.json({ error: 'Internal server error during logout' }, { status: 500, headers });
  }
}
