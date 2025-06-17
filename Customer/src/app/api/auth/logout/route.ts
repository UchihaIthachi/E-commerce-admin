import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import { serialize, parse } from 'cookie';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Corrected import
import { log } from '@/server/application/common/services/logging'; // Assuming this path is correct

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export async function POST(request: NextRequest) {
  if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    log('SEVERE', 'JWT secrets are not configured for logout route.');
    // Clear cookies even if secrets are missing, then return error
    const clearHeaders = getClearCookieHeaders();
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500, headers: clearHeaders });
  }

  const cookieHeader = request.headers.get('cookie');
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const accessToken = cookies.access_token;
  const refreshTokenFromCookie = cookies.refresh_token;

  try {
    let userIdFromToken: string | null = null;
    let sessionInvalidated = false;

    // 1. Attempt Invalidation via Access Token
    if (accessToken) {
      try {
        const decodedAccessToken = jwt.verify(accessToken, JWT_ACCESS_SECRET) as JwtPayload;
        if (decodedAccessToken && typeof decodedAccessToken.userId === 'string') {
          userIdFromToken = decodedAccessToken.userId;
          await prisma.session.deleteMany({
            where: { userId: userIdFromToken },
          });
          log('INFO', `All sessions invalidated for userId: ${userIdFromToken} via access token during logout.`);
          sessionInvalidated = true;
        }
      } catch (jwtError: any) {
        log('WARNING', `Access token verification failed during logout: ${jwtError instanceof Error ? jwtError.message : String(jwtError)}. Proceeding with refresh token if available.`);
        // If access token is invalid (e.g., expired), don't throw, try refresh token
      }
    }

    // 2. Attempt Invalidation via Refresh Token (Fallback or if access token wasn't definitive)
    // This part is crucial if access token didn't exist or was invalid,
    // or if we want to ensure the specific session tied to THIS refresh token is nuked
    // even if other sessions for the user were cleared by access token.
    // However, if all sessions for the user were already deleted via access token,
    // this step might be redundant unless a specific session has a non-standard link to the refresh token.
    // The prompt implies this is a fallback, so it runs if !sessionInvalidated
    if (!sessionInvalidated && refreshTokenFromCookie) {
      try {
        const decodedRefreshToken = jwt.verify(refreshTokenFromCookie, JWT_REFRESH_SECRET) as JwtPayload;
        if (decodedRefreshToken && typeof decodedRefreshToken.userId === 'string') {
          userIdFromToken = decodedRefreshToken.userId; // Could be from refresh token if access token failed

          // Assuming Session.sessionToken stores the HASHED refresh token
          const userSessions = await prisma.session.findMany({
            where: { userId: userIdFromToken },
          });

          let specificSessionDeleted = false;
          for (const session of userSessions) {
            // Compare the provided refresh token with the hashed one in the DB
            if (session.sessionToken && await bcrypt.compare(refreshTokenFromCookie, session.sessionToken)) {
              await prisma.session.delete({
                where: { id: session.id },
              });
              log('INFO', `Specific session ${session.id} invalidated for userId: ${userIdFromToken} via refresh token during logout.`);
              specificSessionDeleted = true;
              break; // Found and deleted the matching session
            }
          }
          if (specificSessionDeleted) {
            sessionInvalidated = true;
          } else {
            log('WARNING', `No session found matching the provided refresh token for userId: ${userIdFromToken} during logout, though token was valid.`);
          }
        }
      } catch (jwtError: any) {
        log('WARNING', `Refresh token verification failed during logout: ${jwtError instanceof Error ? jwtError.message : String(jwtError)}.`);
        // If refresh token is invalid, just proceed to clear cookies
      }
    }

    if (!sessionInvalidated && !accessToken && refreshTokenFromCookie) {
        // Case: No access token, but a refresh token exists.
        // This indicates an attempt to logout from a state where only refresh token might be valid.
        // The above block for refresh token invalidation would have handled this if the token was valid.
        // If it wasn't handled (e.g. token invalid, or session not found), we still log it.
        log('INFO', 'Logout attempt with refresh token but no valid session was invalidated server-side (possibly already invalid or token expired).');
    } else if (!accessToken && !refreshTokenFromCookie) {
        log('INFO', 'Logout attempt with no tokens provided.');
    }


    // 3. Clear Cookies
    const clearHeaders = getClearCookieHeaders();
    log('INFO', `Logout successful for user associated with IP: ${request.ip || 'unknown'}. Cookies cleared.`);
    return NextResponse.json({ message: 'Logout successful' }, { status: 200, headers: clearHeaders });

  } catch (error: any) {
    log('SEVERE', `Logout error: ${error instanceof Error ? error.message : String(error)}`);
    const clearHeaders = getClearCookieHeaders(); // Attempt to clear cookies even on server error
    return NextResponse.json({ error: 'Internal server error during logout' }, { status: 500, headers: clearHeaders });
  }
}

function getClearCookieHeaders() {
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
    path: '/api/auth', // Path specific to refresh token
    expires: new Date(0),
  });

  const headers = new Headers();
  headers.append('Set-Cookie', accessTokenClearCookie);
  headers.append('Set-Cookie', refreshTokenClearCookie);
  return headers;
}
