import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/server/infrastructure/clients/prisma';
import { parse } from 'cookie';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  // This check should ideally be at application startup
  // For serverless functions, it might run per invocation if not memoized
  console.error('CRITICAL: JWT_ACCESS_SECRET is not defined.');
  // Avoid throwing here directly as it might prevent the server from starting/responding
  // Instead, routes relying on it will fail gracefully.
}

export async function GET(request: NextRequest) {
  if (!JWT_ACCESS_SECRET) {
    console.error('Session route: JWT_ACCESS_SECRET is not available.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    // 1. Extract access token from HTTPOnly cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Not authenticated: No cookies found' }, { status: 401 });
    }

    const cookies = parse(cookieHeader);
    const accessToken = cookies.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated: Access token not found' }, { status: 401 });
    }

    // 2. Verify the access token
    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(accessToken, JWT_ACCESS_SECRET) as { userId: string; email: string; role: string; iat: number; exp: number };
    } catch (error) {
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
      // This case should be rare if token was valid, implies DB inconsistency or deleted user
      return NextResponse.json({ error: 'Not authenticated: User not found for token' }, { status: 401 });
    }

    // 4. Return user data
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
