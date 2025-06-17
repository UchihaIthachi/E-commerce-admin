// Customer/src/app/api/account/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import { AddressSchema } from '@/lib/validators/account-schemas';
import { log } from '@/server/application/common/services/logging';

// Placeholder for getting user ID from session.
// Replace with your actual auth logic (e.g., NextAuth, custom JWT parsing).
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) return userIdFromHeader;

    log('WARNING', 'getAuthenticatedUserId is a placeholder. Implement actual user authentication retrieval in addresses API.');
    // For testing without real auth - REMOVE FOR PRODUCTION
    // const testUserId = "debug-user-id-address-test";
    // const user = await prisma.user.findUnique({where: {id: testUserId}});
    // if(user) return user.id;
    // try {
    //     const createdUser = await prisma.user.create({data: {id: testUserId, email: `${testUserId}@example.com`, name: "Test User"}});
    //     return createdUser.id;
    // } catch (e) { /* ignore if already exists */ }
    return null;
}

// GET /api/account/addresses - Fetch all addresses for the authenticated user
export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to GET addresses: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' } // Optional: order by creation date or primary status
    });
    log('INFO', `Fetched ${addresses.length} addresses for userId: ${userId}`);
    return NextResponse.json(addresses, { status: 200 });
  } catch (error) {
    log('SEVERE', `Error fetching addresses for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch addresses.' }, { status: 500 });
  }
}

// POST /api/account/addresses - Create a new address for the authenticated user
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to POST address: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    log('WARNING', `Invalid JSON input for POST address for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
  }

  const validationResult = AddressSchema.safeParse(requestBody);
  if (!validationResult.success) {
    log('WARNING', `Address validation failed for userId: ${userId}: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { primary, ...addressData } = validationResult.data;

  try {
    let newAddress;
    if (primary) {
      // If setting new address as primary, first set all others to not primary
      [_, newAddress] = await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId: userId, primary: true },
          data: { primary: false },
        }),
        prisma.address.create({
          data: {
            ...addressData,
            userId: userId,
            primary: true,
          },
        }),
      ]);
      log('INFO', `Created new primary address for userId: ${userId}. AddressId: ${newAddress.id}`);
    } else {
      // If not setting as primary, just create it.
      // Consider logic: if no other primary address exists, should this become primary?
      // For now, keeping it simple: if primary is false, it's created as false.
      newAddress = await prisma.address.create({
        data: {
          ...addressData,
          userId: userId,
          primary: false, // Explicitly false, though default in schema is false
        },
      });
      log('INFO', `Created new address for userId: ${userId}. AddressId: ${newAddress.id}`);
    }
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    log('SEVERE', `Error creating address for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to create address.' }, { status: 500 });
  }
}
