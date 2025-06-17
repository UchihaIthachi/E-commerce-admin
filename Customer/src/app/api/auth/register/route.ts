import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import bcrypt from 'bcryptjs';
import prisma from '@/server/infrastructure/clients/prisma';
import { registerLimiter, getClientIp, consumeLimiter } from '@/lib/rate-limiter'; // Import rate limiter
import { RegisterSchema } from '@/lib/validators/auth-schemas';
import { Role } from '@prisma/client';
import { log } from '@/server/application/common/services/logging';

export async function POST(request: NextRequest) { // Changed type to NextRequest
  const clientIp = getClientIp(request);
  const isAllowed = await consumeLimiter(registerLimiter, clientIp, 'Too many registration attempts. Please try again later.');

  if (!isAllowed) {
    return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const validationResult = RegisterSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, name } = validationResult.data; // Use validated data

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      log('WARNING', `Registration attempt for existing user: ${email}`);
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User and Account records in Prisma
    // Use a transaction to ensure both records are created or none are
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          emailVerified: null, // Or new Date() if verifying immediately (not for now)
          image: null, // Optional: handle user image upload later
          role: Role.CUSTOMER, // Default role
        },
      });

      await tx.account.create({
        data: {
          userId: newUser.id,
          type: 'credentials', // Custom provider type
          provider: 'credentials', // Specific provider
          providerAccountId: newUser.id, // Or some other unique ID related to credentials
          password: hashedPassword,
          // Optional fields for OAuth, not used here:
          // refresh_token: null,
          // access_token: null,
          // expires_at: null,
          // token_type: null,
          // scope: null,
          // id_token: null,
          // session_state: null,
        },
      });
      return newUser;
    });

    // 5. (Optional) Send verification email - Skip for now

    // 6. Return success response (excluding sensitive data like password)
    const { ...userWithoutPassword } = user; // This doesn't remove password if it's on user model
                                         // The user object from prisma.user.create won't have password
                                         // but good practice to be explicit if fetching user later.

    log('INFO', `User registered successfully: ${user.email}`);
    return NextResponse.json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });

  } catch (error) {
    log('SEVERE', `Registration error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof SyntaxError) { // Handle cases where request.json() fails
        return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
