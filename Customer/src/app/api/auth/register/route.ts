import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/server/infrastructure/clients/prisma'; // Assuming '@/' is configured for 'Customer/src/'
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 1. Validate inputs
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }
    // Basic email format validation (can be more robust)
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
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

    return NextResponse.json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof SyntaxError) { // Handle cases where request.json() fails
        return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
