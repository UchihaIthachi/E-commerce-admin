import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/server/infrastructure/clients/prisma';
import { parse } from 'cookie';
import { log } from '@/server/application/common/services/logging';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  // This check should ideally be at application startup
  // For serverless functions, it might run per invocation if not memoized
  log('SEVERE', 'CRITICAL: JWT_ACCESS_SECRET is not defined at application startup/module load for session route.');
  // Avoid throwing here directly as it might prevent the server from starting/responding
  // Instead, routes relying on it will fail gracefully.
}

export async function GET(request: NextRequest) {
  if (!JWT_ACCESS_SECRET) {
    log('SEVERE', 'Session route: JWT_ACCESS_SECRET is not available during request.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    // 1. Extract access token from HTTPOnly cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      log('INFO', 'Session validation failed: No cookies found.');
      return NextResponse.json({ error: 'Not authenticated: No cookies found' }, { status: 401 });
    }

    const cookies = parse(cookieHeader);
    const accessToken = cookies.access_token;

    if (!accessToken) {
      log('INFO', 'Session validation failed: Access token not found in cookies.');
      return NextResponse.json({ error: 'Not authenticated: Access token not found' }, { status: 401 });
    }

    // 2. Verify the access token
    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(accessToken, JWT_ACCESS_SECRET) as { userId: string; email: string; role: string; iat: number; exp: number };
    } catch (error) {
      log('INFO', `Session validation failed: Invalid or expired access token. Error: ${error instanceof Error ? error.message : String(error)}`);
      // Token is invalid (e.g., signature mismatch, expired)
      return NextResponse.json({ error: 'Not authenticated: Invalid or expired access token' }, { status: 401 });
    }

    // 3. If valid, retrieve user data
    const user = await prisma.user.findUnique({
      where: { id: decodedAccessToken.userId },
      select: { // Explicitly select fields to return, excluding sensitive ones
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        fname: true,
        lname: true,
        // Do NOT include fields like password hashes from other tables or sensitive relations
      },
    });

    if (!user) {
      log('WARNING', `User not found for token in session validation. UserId: ${decodedAccessToken.userId}`);
      // This case should be rare if token was valid, implies DB inconsistency or deleted user
      return NextResponse.json({ error: 'Not authenticated: User not found for token' }, { status: 401 });
    }

    log('INFO', `Session validated for userId: ${decodedAccessToken.userId}`);
    // 4. Return user data
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    log('SEVERE', `Session retrieval error: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
