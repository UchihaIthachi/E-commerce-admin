// Customer/src/app/api/account/addresses/[addressId]/set-primary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import { AddressIdSchema } from '@/lib/validators/account-schemas';
import { log } from '@/server/application/common/services/logging';

// Placeholder for getting user ID from session.
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) return userIdFromHeader;
    log('WARNING', 'getAuthenticatedUserId is a placeholder. Implement actual user authentication retrieval in set-primary API.');
    return null;
}

interface RouteContext {
    params: {
        addressId: string;
    };
}

// PATCH /api/account/addresses/{addressId}/set-primary - Set an address as primary
export async function PATCH(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to PATCH set-primary address: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { addressId } = context.params;
  const idValidation = AddressIdSchema.safeParse({ addressId });
  if (!idValidation.success) {
      log('WARNING', `Invalid addressId format for PATCH set-primary request: ${addressId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Invalid address ID format.' }, { status: 400 });
  }

  try {
    // Check if the target address exists and belongs to the user
    const targetAddress = await prisma.address.findFirst({
        where: { id: addressId, userId: userId }
    });

    if (!targetAddress) {
        log('WARNING', `Address to set as primary not found or not owned by user. AddressId: ${addressId}, userId: ${userId}`);
        return NextResponse.json({ error: 'Address not found or access denied.' }, { status: 404 });
    }

    // If it's already primary, no need to do anything, return success
    if (targetAddress.primary) {
        log('INFO', `Address ${addressId} is already primary for userId: ${userId}. No action taken.`);
        return NextResponse.json(targetAddress, { status: 200 });
    }

    // Use a transaction to ensure atomicity
    const [_, updatedAddress] = await prisma.$transaction([
      // 1. Set primary = false for all other addresses of the user
      prisma.address.updateMany({
        where: {
          userId: userId,
          primary: true,
          // NOT: { id: addressId } // No need for NOT here, as we update the target one separately
        },
        data: { primary: false },
      }),
      // 2. Set primary = true for the target address
      prisma.address.update({
        where: { id: addressId }, // We already confirmed it belongs to the user
        data: { primary: true },
      }),
    ]);

    log('INFO', `Set address ${addressId} as primary for userId: ${userId}`);
    // Fetch the updated address to return it, as updateMany doesn't return the records
    const finalUpdatedAddress = await prisma.address.findUnique({where: {id: addressId}});

    return NextResponse.json(finalUpdatedAddress, { status: 200 });

  } catch (error) {
    log('SEVERE', `Error setting address ${addressId} as primary for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to set address as primary.' }, { status: 500 });
  }
}
