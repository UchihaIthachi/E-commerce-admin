import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string; // Assuming Role is part of the token
  // Add any other fields present in your access token payload
}

// Authentication helper logic (can be refactored into a separate file later if used elsewhere)
async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  if (!JWT_ACCESS_SECRET) {
    console.error('JWT_ACCESS_SECRET is not defined.');
    return null; // Server configuration error
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null; // No cookies found
  }

  const cookies = parse(cookieHeader);
  const accessToken = cookies.access_token;

  if (!accessToken) {
    return null; // Access token not found
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET) as AuthenticatedUser & { userId: string };
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
        return decoded;
    }
    return null; // Invalid token payload structure
  } catch (error) {
    // Token verification failed (expired, invalid signature, etc.)
    console.warn('Access token verification failed:', error);
    return null;
  }
}

// GET Handler
export async function GET(request: NextRequest) {
  const authenticatedUser = await getAuthenticatedUser(request);

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: authenticatedUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        fname: true, // from schema
        lname: true, // from schema
        country: true, // from schema
        phone_1: true, // from schema
        // dob: true, // DateTime, ensure client can handle or format it
        // gender: true, // from schema
        // createdAt: true, // Not in current User schema
        // updatedAt: true, // Not in current User schema
      },
    });

    if (!userProfile) {
      // This case should be rare if token is valid and user ID from token is correct
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT Handler
export async function PUT(request: NextRequest) {
  const authenticatedUser = await getAuthenticatedUser(request);

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, image, fname, lname, country, phone_1 /*, dob, gender */ } = body;

    // Validate input data (basic validation)
    const updateData: {
        name?: string;
        image?: string;
        fname?: string;
        lname?: string;
        country?: string;
        phone_1?: string;
        // dob?: Date;
        // gender?: string;
    } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (image !== undefined) {
      if (typeof image !== 'string' && image !== null) { // Allow null to remove image
        return NextResponse.json({ error: 'Image must be a string or null' }, { status: 400 });
      }
      updateData.image = image;
    }
    if (fname !== undefined) {
        if (typeof fname !== 'string' && fname !== null) {
            return NextResponse.json({ error: 'First name must be a string or null' }, { status: 400 });
        }
        updateData.fname = fname;
    }
    if (lname !== undefined) {
        if (typeof lname !== 'string' && lname !== null) {
            return NextResponse.json({ error: 'Last name must be a string or null' }, { status: 400 });
        }
        updateData.lname = lname;
    }
    if (country !== undefined) {
        if (typeof country !== 'string' && country !== null) {
            return NextResponse.json({ error: 'Country must be a string or null' }, { status: 400 });
        }
        updateData.country = country;
    }
    if (phone_1 !== undefined) {
        if (typeof phone_1 !== 'string' && phone_1 !== null) {
            return NextResponse.json({ error: 'Phone number must be a string or null' }, { status: 400 });
        }
        updateData.phone_1 = phone_1;
    }
    // Add validation for other fields like dob (date format), gender if they are allowed.

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    // Prevent email updates through this endpoint
    if (body.email) {
      return NextResponse.json({ error: 'Email updates are not allowed via this endpoint.' }, { status: 400 });
    }

    // Add `updatedAt` manually if not automatically handled by Prisma `@updatedAt`
    // updateData.updatedAt = new Date(); // Not needed if schema has @updatedAt

    const updatedUserProfile = await prisma.user.update({
      where: { id: authenticatedUser.userId },
      data: updateData,
      select: { // Return the same selected fields as GET
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        fname: true,
        lname: true,
        country: true,
        phone_1: true,
        // dob: true,
        // gender: true,
        // createdAt: true, // Not in current User schema
        // updatedAt: true, // Not in current User schema
      },
    });

    return NextResponse.json(updatedUserProfile, { status: 200 });

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found for update
        return NextResponse.json({ error: 'User not found for update' }, { status: 404 });
    }
    if (error instanceof SyntaxError) { // Handle cases where request.json() fails
        return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
