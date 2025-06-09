import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import crypto from 'crypto'; // For generating a random token
// import { sendPasswordResetEmail } from '@/lib/email'; // Placeholder for email sending

// Configuration for password reset token
const PASSWORD_RESET_TOKEN_EXPIRES_IN_MS = 3600000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      // Still return a generic message to prevent email enumeration
      return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' }, { status: 200 });
    }

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
