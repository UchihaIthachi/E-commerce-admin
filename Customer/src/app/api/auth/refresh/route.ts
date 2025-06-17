import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/server/infrastructure/clients/prisma';
import { refreshTokenLimiter, getClientIp, consumeLimiter } from '@/lib/rate-limiter'; // Import rate limiter
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { parse } from 'cookie'; // To parse incoming cookies
import { log } from '@/server/application/common/services/logging';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secret keys must be defined in environment variables.');
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const isAllowed = await consumeLimiter(refreshTokenLimiter, clientIp, 'Too many refresh attempts. Please try again later.');

  if (!isAllowed) {
    return NextResponse.json({ error: 'Too many refresh attempts. Please try again later.' }, { status: 429 });
  }

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
      log('WARNING', `Invalid or expired refresh token attempt. Error: ${error instanceof Error ? error.message : String(error)}`);
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

    // 3. Look up the session by comparing the provided token with stored hashed tokens.
    // First, retrieve all active sessions for the user identified in the JWT.
    // This is necessary because we don't store the raw token and cannot directly query by it.
    const userSessions = await prisma.session.findMany({
      where: {
        userId: decodedRefreshToken.userId, // User ID from the verified refresh token
        expires: { gt: new Date() }       // Only consider sessions that haven't expired
      },
      include: { user: true } // Include user data for generating new tokens
    });

    // If no active sessions are found for the user, the token is invalid or has been revoked.
    if (!userSessions || userSessions.length === 0) {
      log('WARNING', `No active session found for refresh token for userId: ${decodedRefreshToken?.userId}`);
      const clearRefreshTokenCookie = serialize('refresh_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', expires: new Date(0) });
      const headers = new Headers();
      headers.append('Set-Cookie', clearRefreshTokenCookie);
      return NextResponse.json({ error: 'No active sessions found for user' }, { status: 401, headers });
    }

    // Iterate through the user's active sessions.
    // For each session, compare the refresh token from the cookie with the stored hashed session token.
    let validSession: any = null; // Consider defining a proper type for session with user
    for (const currentSession of userSessions) {
      // Use bcrypt.compare to securely compare the plain-text token from the cookie
      // with the hashed token stored in the database.
      const isMatch = await bcrypt.compare(refreshTokenFromCookie, currentSession.sessionToken);
      if (isMatch) {
        // Defensive check: Ensure the session from DB is not expired.
        // This is somewhat redundant due to the 'expires: { gt: new Date() }' in the query,
        // but provides an extra layer of security against potential race conditions or clock skew.
        if (new Date(currentSession.expires) < new Date()) {
            await prisma.session.delete({ where: { id: currentSession.id }}); // Clean up this specific expired session
            continue; // This session was expired, try to find another match
        }
        validSession = currentSession; // Found a valid, matching session
        break; // Exit the loop once a match is found
      }
    }

    // If no session produced a match, the provided refresh token is invalid or revoked.
    if (!validSession) {
      log('WARNING', `Refresh token session not found or revoked for userId: ${decodedRefreshToken?.userId}`);
      const clearRefreshTokenCookie = serialize('refresh_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', expires: new Date(0) });
      const headers = new Headers();
      headers.append('Set-Cookie', clearRefreshTokenCookie);
      return NextResponse.json({ error: 'Session not found or token revoked' }, { status: 401, headers });
    }

    // Ensure the user from the token matches the session user (already implicitly done by querying for decodedRefreshToken.userId)
    // if (validSession.userId !== decodedRefreshToken.userId) { // This check is technically redundant now
    //     return NextResponse.json({ error: 'Token user mismatch' }, { status: 403 });
    // }

    const user = validSession.user;

    // 4. Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    // 5. Implement refresh token rotation:
    // Delete the old valid session using its ID. This is part of refresh token rotation.
    // Rotating tokens helps mitigate the risk of a compromised refresh token being used indefinitely.
    await prisma.session.delete({
      where: { id: validSession.id },
    });

    // Generate a new refresh token
    const newRefreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    const newSessionExpiresIn = Date.now() + (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MS ? parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MS) : 7 * 24 * 60 * 60 * 1000);

    // Store the new refresh token (hashed) in the session table.
    // Hashing is crucial for security, as explained in login/google callback routes.
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: hashedNewRefreshToken, // Store the hash of the new refresh token
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

    log('INFO', `Token refreshed for userId: ${user.id}`);
    // 7. Return the new access token
    return NextResponse.json({
      message: 'Token refreshed successfully',
      // accessToken: newAccessToken, // Optionally return in body
    }, { status: 200, headers });

  } catch (error) {
    log('SEVERE', `Refresh token error: ${error instanceof Error ? error.message : String(error)}`);
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
