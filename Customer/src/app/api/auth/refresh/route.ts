import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/server/infrastructure/clients/prisma';
import { serialize } from 'cookie';
import { parse } from 'cookie'; // To parse incoming cookies

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secret keys must be defined in environment variables.');
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extract refresh token from HTTPOnly cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'No cookies found' }, { status: 401 });
    }

    const cookies = parse(cookieHeader);
    const refreshTokenFromCookie = cookies.refresh_token;

    if (!refreshTokenFromCookie) {
      return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
    }

    // 2. Validate the JWT signature and decode
    let decodedRefreshToken;
    try {
      decodedRefreshToken = jwt.verify(refreshTokenFromCookie, JWT_REFRESH_SECRET) as { userId: string; email: string; iat: number; exp: number };
    } catch (error) {
      // Clear potentially invalid refresh token cookie
      const clearRefreshTokenCookie = serialize('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        expires: new Date(0), // Expire immediately
      });
      const headers = new Headers();
      headers.append('Set-Cookie', clearRefreshTokenCookie);
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401, headers });
    }

    // 3. Look up the token in the Session table
    const session = await prisma.session.findUnique({
      where: { sessionToken: refreshTokenFromCookie },
      include: { user: true }
    });

    if (!session) {
      // Token not found in DB, might have been revoked or is invalid
      // Clear the cookie as a precaution
      const clearRefreshTokenCookie = serialize('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        expires: new Date(0),
      });
      const headers = new Headers();
      headers.append('Set-Cookie', clearRefreshTokenCookie);
      return NextResponse.json({ error: 'Session not found or token revoked' }, { status: 401, headers });
    }

    // Check if session is expired based on DB (though JWT expiry should also catch this)
    if (new Date(session.expires) < new Date()) {
        await prisma.session.delete({ where: { id: session.id }}); // Clean up expired session
        const clearRefreshTokenCookie = serialize('refresh_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/api/auth',
            expires: new Date(0),
        });
        const headers = new Headers();
        headers.append('Set-Cookie', clearRefreshTokenCookie);
        return NextResponse.json({ error: 'Refresh token expired (session)' }, { status: 401, headers });
    }

    // Ensure the user from the token matches the session user
    if (session.userId !== decodedRefreshToken.userId) {
        return NextResponse.json({ error: 'Token user mismatch' }, { status: 403 });
    }

    const user = session.user;

    // 4. Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    // 5. Implement refresh token rotation:
    // Delete the old session (old refresh token)
    await prisma.session.delete({
      where: { sessionToken: refreshTokenFromCookie },
    });

    // Generate a new refresh token
    const newRefreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    const newSessionExpiresIn = Date.now() + (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MS ? parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MS) : 7 * 24 * 60 * 60 * 1000);

    // Store the new refresh token in the session table
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: newRefreshToken,
        expires: new Date(newSessionExpiresIn),
      },
    });

    // 6. Set new tokens in cookies
    const accessTokenCookie = serialize('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: (process.env.JWT_ACCESS_TOKEN_MAX_AGE ? parseInt(process.env.JWT_ACCESS_TOKEN_MAX_AGE) : 15 * 60)
    });

    const newRefreshTokenCookie = serialize('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: (process.env.JWT_REFRESH_TOKEN_MAX_AGE ? parseInt(process.env.JWT_REFRESH_TOKEN_MAX_AGE) : 7 * 24 * 60 * 60)
    });

    const headers = new Headers();
    headers.append('Set-Cookie', accessTokenCookie);
    headers.append('Set-Cookie', newRefreshTokenCookie);

    // 7. Return the new access token
    return NextResponse.json({
      message: 'Token refreshed successfully',
      // accessToken: newAccessToken, // Optionally return in body
    }, { status: 200, headers });

  } catch (error) {
    console.error('Refresh token error:', error);
    // Fallback for unexpected errors
    const clearRefreshTokenCookie = serialize('refresh_token', '', { // Attempt to clear cookie on error
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        expires: new Date(0),
    });
    const headers = new Headers();
    headers.append('Set-Cookie', clearRefreshTokenCookie);
    return NextResponse.json({ error: 'Internal server error during token refresh' }, { status: 500, headers });
  }
}
