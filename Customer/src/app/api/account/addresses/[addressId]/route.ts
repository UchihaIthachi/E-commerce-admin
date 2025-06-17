// Customer/src/app/api/account/addresses/[addressId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import { AddressSchema, AddressIdSchema } from '@/lib/validators/account-schemas';
import { log } from '@/server/application/common/services/logging';

// Placeholder for getting user ID from session.
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) return userIdFromHeader;
    log('WARNING', 'getAuthenticatedUserId is a placeholder. Implement actual user authentication retrieval in addresses/[addressId] API.');
    return null;
}

interface RouteContext {
    params: {
        addressId: string;
    };
}

// GET /api/account/addresses/{addressId} - Fetch a single address
export async function GET(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to GET address by ID: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { addressId } = context.params;
  const idValidation = AddressIdSchema.safeParse({ addressId });
  if (!idValidation.success) {
      log('WARNING', `Invalid addressId format for GET request: ${addressId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Invalid address ID format.' }, { status: 400 });
  }

  try {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: userId },
    });

    if (!address) {
      log('WARNING', `Address not found or not owned by user. AddressId: ${addressId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
    }
    log('INFO', `Fetched addressId: ${addressId} for userId: ${userId}`);
    return NextResponse.json(address, { status: 200 });
  } catch (error) {
    log('SEVERE', `Error fetching addressId: ${addressId} for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch address.' }, { status: 500 });
  }
}

// PUT /api/account/addresses/{addressId} - Update an existing address
export async function PUT(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to PUT address: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { addressId } = context.params;
  const idValidation = AddressIdSchema.safeParse({ addressId });
  if (!idValidation.success) {
      log('WARNING', `Invalid addressId format for PUT request: ${addressId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Invalid address ID format.' }, { status: 400 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    log('WARNING', `Invalid JSON input for PUT address. AddressId: ${addressId}, userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
  }

  const validationResult = AddressSchema.safeParse(requestBody);
  if (!validationResult.success) {
    log('WARNING', `Address validation failed for PUT. AddressId: ${addressId}, userId: ${userId}: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { primary, ...addressDataToUpdate } = validationResult.data;

  try {
    // Check if the address exists and belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: userId },
    });

    if (!existingAddress) {
      log('WARNING', `Attempt to PUT non-existent or unauthorized address. AddressId: ${addressId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Address not found or access denied.' }, { status: 404 });
    }

    let updatedAddress;
    if (primary) {
      // If setting this address as primary
      [_, updatedAddress] = await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId: userId, primary: true, NOT: { id: addressId } },
          data: { primary: false },
        }),
        prisma.address.update({
          where: { id: addressId },
          data: { ...addressDataToUpdate, primary: true },
        }),
      ]);
      log('INFO', `Updated address ${addressId} to primary for userId: ${userId}.`);
    } else {
      // If unsetting primary, or just updating other fields
      // Check if this address was primary and if it's the only one.
      // If it was primary and primary is now being set to false, another address should become primary.
      // This logic can be complex (e.g., pick the next oldest). For now, allow unsetting.
      // A separate "set primary" endpoint is often better for explicit primary changes.
      // The current PATCH endpoint handles "set primary" explicitly.
      // If this PUT is unsetting primary, we must ensure there's another primary if possible,
      // or the user ends up with no primary address.
      // For this iteration, if primary is false, we just set it.
      // The set-primary endpoint is the canonical way to make an address primary.
      if (existingAddress.primary && !primary) {
        log('INFO', `Address ${addressId} (userId: ${userId}) is being changed from primary to non-primary. Consider implications if no other primary exists.`);
      }
      updatedAddress = await prisma.address.update({
        where: { id: addressId }, // Prisma ensures we only update if it's this ID
        data: { ...addressDataToUpdate, primary: primary }, // primary could be false here
      });
      log('INFO', `Updated address ${addressId} for userId: ${userId}. Primary status set to: ${primary}`);
    }
    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (error) {
    log('SEVERE', `Error updating address ${addressId} for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to update address.' }, { status: 500 });
  }
}

// DELETE /api/account/addresses/{addressId} - Delete an address
export async function DELETE(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to DELETE address: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { addressId } = context.params;
  const idValidation = AddressIdSchema.safeParse({ addressId });
  if (!idValidation.success) {
      log('WARNING', `Invalid addressId format for DELETE request: ${addressId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Invalid address ID format.' }, { status: 400 });
  }

  try {
    // Verify ownership before deleting
    const addressToDelete = await prisma.address.findFirst({
      where: { id: addressId, userId: userId },
    });

    if (!addressToDelete) {
      log('WARNING', `Attempt to DELETE non-existent or unauthorized address. AddressId: ${addressId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Address not found or access denied.' }, { status: 404 });
    }

    // If deleting primary address, an ideal scenario would be to set another as primary.
    // For this iteration, we'll just delete it. The client might need to handle picking a new primary.
    if (addressToDelete.primary) {
        log('INFO', `Primary address ${addressId} is being deleted by userId: ${userId}. Consider logic for re-assigning primary status.`);
        // Potential logic: Find another address and make it primary.
        // const otherAddress = await prisma.address.findFirst({ where: { userId, NOT: { id: addressId } }, orderBy: { createdAt: 'asc' }});
        // if (otherAddress) { await prisma.address.update({ where: { id: otherAddress.id }, data: { primary: true }}); }
    }

    await prisma.address.delete({
      where: { id: addressId }, // Prisma ensures we only delete if it's this ID
    });
    log('INFO', `Deleted address ${addressId} for userId: ${userId}`);
    return NextResponse.json({ message: 'Address deleted successfully.' }, { status: 200 }); // Or 204 No Content
  } catch (error) {
    log('SEVERE', `Error deleting address ${addressId} for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to delete address.' }, { status: 500 });
  }
}
