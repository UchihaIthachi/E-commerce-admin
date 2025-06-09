import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // 1. Validate inputs
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // 2. Find the VerificationToken in the DB by the token value
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    // 3. Validate the token
    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (new Date(verificationToken.expires) < new Date()) {
      // Token has expired, delete it
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // 4. If valid, retrieve user's email and find the user
    const userEmail = verificationToken.identifier;
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { accounts: true } // Include accounts to find the 'credentials' one
    });

    if (!user) {
      // Should not happen if token was valid and identifier is correct
      // Delete the token as a precaution, as it might be an orphaned token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: 'User not found for this token' }, { status: 400 });
    }

    // Find the specific account associated with 'credentials'
    const credentialsAccount = user.accounts.find(acc => acc.provider === 'credentials');

    if (!credentialsAccount) {
        // This would be an inconsistent state: user exists but no credentials account
        await prisma.verificationToken.delete({ where: { token } }); // Clean up token
        return NextResponse.json({ error: 'Password account not found for this user' }, { status: 500 });
    }

    // 5. Hash the newPassword
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update the user's password in the Account table and delete the token
    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: credentialsAccount.id },
        data: { password: hashedPassword },
      });

      await tx.verificationToken.delete({
        where: { token },
      });
    });

    // 7. Return success response
    return NextResponse.json({ message: 'Password has been reset successfully' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
