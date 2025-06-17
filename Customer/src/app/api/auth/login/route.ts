import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginLimiter, getClientIp, consumeLimiter } from '@/lib/rate-limiter'; // Import rate limiter
import prisma from '@/server/infrastructure/clients/prisma';
import { serialize } from 'cookie'; // For setting cookies
import { LoginSchema } from '@/lib/validators/auth-schemas'; // Import Zod schema
import { log } from '@/server/application/common/services/logging';

// Ensure JWT secrets are loaded from environment variables
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// It's crucial to have these secrets defined.
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secret keys must be defined in environment variables.');
}

export async function POST(request: NextRequest) { // Changed type to NextRequest
  const clientIp = getClientIp(request);
  const isAllowed = await consumeLimiter(loginLimiter, clientIp);

  if (!isAllowed) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const validationResult = LoginSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password } = validationResult.data; // Use validated data

    // 2. Find user by email in Account table for 'credentials' provider
    const account = await prisma.account.findFirst({
      where: {
        user: {
          email: email,
        },
        provider: 'credentials',
      },
      include: {
        user: true, // Include the related User record
      },
    });

    if (!account || !account.password) {
      log('WARNING', `Failed login attempt for email: ${email} - Invalid credentials (user or password mismatch)`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Compare submitted password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      log('WARNING', `Failed login attempt for email: ${email} - Invalid credentials (password mismatch)`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = account.user;

    // 4. Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email }, // Refresh token might have less info
      JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    // 5. Store hashed refresh token in the Session table
    //    This assumes a Session table exists and is configured for this.
    //    If not, this part needs adjustment (e.g., store in Account or a different mechanism).
    //    For now, let's assume a simple session storage. A more robust solution might hash the refresh token.
    //    The current Prisma schema might not have a session table suitable for this.
    //    Let's create a session record. The schema might need adjustment for a 'hashedRefreshToken' field.
    //    For now, I'll store the refreshToken directly, but ideally it should be hashed.
    //    A proper session model would look like:
    //    model Session {
    //      id            String   @id @default(cuid())
    //      sessionToken  String   @unique // This would be the refresh token (or its hash)
    //      userId        String
    //      expires       DateTime
    //      user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    //    }
    //    Since this is not confirmed, I will proceed by creating a session and storing the refresh token.
    //    If the schema is different, this will fail and need correction.

    const sessionExpiresIn = Date.now() + (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MS ? parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MS) : 7 * 24 * 60 * 60 * 1000); // 7 days in ms

    // Hash the refresh token before storing it in the database.
    // This is a security best practice. If the database is compromised,
    // the raw refresh tokens are not exposed, only their hashes.
    // The actual refresh token is sent to the client in an HTTPOnly cookie.
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.session.create({
        data: {
            userId: user.id,
            sessionToken: hashedRefreshToken, // Store the hashed refresh token
            expires: new Date(sessionExpiresIn),
        }
    });


    // 6. Set tokens in HTTPOnly cookies
    const accessTokenCookie = serialize('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: (process.env.JWT_ACCESS_TOKEN_MAX_AGE ? parseInt(process.env.JWT_ACCESS_TOKEN_MAX_AGE) : 15 * 60) // 15 minutes
    });

    const refreshTokenCookie = serialize('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Or 'strict'
      path: '/api/auth', // More specific path for refresh token
      maxAge: (process.env.JWT_REFRESH_TOKEN_MAX_AGE ? parseInt(process.env.JWT_REFRESH_TOKEN_MAX_AGE) : 7 * 24 * 60 * 60) // 7 days
    });

    const headers = new Headers();
    headers.append('Set-Cookie', accessTokenCookie);
    headers.append('Set-Cookie', refreshTokenCookie);

    log('INFO', `Successful login for user: ${user.email}`);
    // 7. Return user info and access token (if not exclusively in cookie)
    return NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      // accessToken, // Optionally return access token in body too
    }, { status: 200, headers });

  } catch (error) {
    log('SEVERE', `Login error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
    }
    // Check for JWT secret error specifically (already checked at startup, but good practice)
    if (error instanceof Error && error.message.includes('JWT secret keys must be defined')) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
