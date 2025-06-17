import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import crypto from 'crypto';
import { passwordResetLimiter, getClientIp, consumeLimiter } from '@/lib/rate-limiter'; // Import rate limiter
import { RequestPasswordResetSchema } from '@/lib/validators/auth-schemas'; // Import Zod schema
// import { sendPasswordResetEmail } from '@/lib/email'; // Placeholder for email sending

// Configuration for password reset token
const PASSWORD_RESET_TOKEN_EXPIRES_IN_MS = 3600000; // 1 hour

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  // For request-password-reset, we apply rate limiting before parsing the body or validating email format.
  // This is because the act of requesting itself should be limited to prevent spamming.
  const isAllowed = await consumeLimiter(passwordResetLimiter, clientIp, 'Too many password reset requests. Please try again later.');

  if (!isAllowed) {
    // Even if rate-limited, return a generic message to prevent revealing if an email/IP is being targeted.
    // Log the rate-limiting event server-side for monitoring.
    console.warn(`Rate limit exceeded for password reset request from IP: ${clientIp}`);
    return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' }, { status: 200 }); // status 429 would reveal IP is targeted
  }

  try {
    const rawBody = await request.json();
    const validationResult = RequestPasswordResetSchema.safeParse(rawBody);

    if (!validationResult.success) {
      // Even with validation error, return a generic message to prevent email enumeration
      // Log the actual error for server-side debugging
      console.error("Password reset request validation error:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' }, { status: 200 });
    }
    const { email } = validationResult.data;

    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // User not found, still return a generic message
      return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' }, { status: 200 });
    }

    // 3. Generate a VerificationToken
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_IN_MS);

    // The VerificationToken model in Prisma has: identifier, token, expires
    // We will store the rawToken directly as 'token' for simplicity in this step.
    // For enhanced security, one might hash `rawToken` before storing and send `rawToken` to user,
    // then hash the user-provided token during reset to match it.
    // However, the schema has `token @unique`, implying the raw token is stored.
    // Let's stick to storing the raw token for now as per schema implications.

    // Delete any existing password reset tokens for this user to prevent multiple valid tokens
    await prisma.verificationToken.deleteMany({
        where: {
            identifier: email,
            // Optionally, add a type if VerificationToken is used for other purposes, e.g. email verification
            // For now, assuming all tokens in this table for a given email are for password reset
        }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email, // User's email
        token: rawToken,   // The raw, unhashed token that will be sent to the user
        expires,
      },
    });

    // 4. Send an email to the user with a link containing the token
    // This is where you would integrate with an email sending service.
    // For now, we'll just log it for development/testing.
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;
    console.log(`Password reset requested for ${email}. Token: ${rawToken}`);
    console.log(`Reset link (for dev): ${resetLink}`);
    // await sendPasswordResetEmail(email, resetLink); // Actual email sending function

    // 5. Return success response (always, to prevent email enumeration)
    return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' }, { status: 200 });

  } catch (error) {
    console.error('Request password reset error:', error);
    // Do not reveal specific errors to the client for security reasons
    return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' }, { status: 200 });
    // Or a generic error if something truly unexpected happened:
    // return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
