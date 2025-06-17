import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import bcrypt from 'bcryptjs';
import { ResetPasswordSchema } from '@/lib/validators/auth-schemas'; // Import Zod schema
import { log } from '@/server/application/common/services/logging';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validationResult = ResetPasswordSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { token, newPassword } = validationResult.data; // Use validated data

    // 2. Find the VerificationToken in the DB by the token value
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    // 3. Validate the token
    if (!verificationToken) {
      log('WARNING', `Password reset attempt with invalid token: ${token}`);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (new Date(verificationToken.expires) < new Date()) {
      log('WARNING', `Password reset attempt with expired token: ${token}`);
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

    log('INFO', `Password reset successful for user: ${userEmail}`);
    // 7. Return success response
    return NextResponse.json({ message: 'Password has been reset successfully' }, { status: 200 });

  } catch (error) {
    log('SEVERE', `Reset password error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
