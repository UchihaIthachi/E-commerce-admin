// Customer/src/app/api/account/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import { log } from '@/server/application/common/services/logging';
import { z } from 'zod';

// Placeholder for getting user ID
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) return userIdFromHeader;
    log('WARNING', 'getAuthenticatedUserId is a placeholder in order detail API. Implement actual auth.');
    return null;
}

const ParamsSchema = z.object({
  orderId: z.string().cuid("Invalid order ID format."),
});

interface RouteContext {
    params: {
        orderId: string;
    };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to GET order by ID: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const paramsValidation = ParamsSchema.safeParse(context.params);
  if (!paramsValidation.success) {
      log('WARNING', `Invalid orderId format for GET request: ${context.params.orderId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Invalid order ID format.', details: paramsValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const { orderId } = paramsValidation.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { // Fetch all fields for orderItems in detail view
            select: {
                id: true,
                sanityId: true,
                name: true,
                thumbnail: true,
                color: true,
                size: true,
                count: true,
                price: true, // Stored in cents
                // discount: true, // if you have this field
                orderId: true, // if needed
            }
        },
        delivery: {
          include: {
            address: true, // Include the full shipping address
          },
        },
        // user: { select: { name: true, email: true } } // Optionally include basic user info if needed
      },
    });

    if (!order) {
      log('WARNING', `Order not found. OrderId: ${orderId}, userId: ${userId}`);
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Ownership Check
    if (order.userId !== userId) {
      log('WARNING', `User ${userId} attempted to access order ${orderId} owned by ${order.userId}.`);
      return NextResponse.json({ error: 'Order not found or access denied.' }, { status: 404 }); // Return 404 for security
    }

    // Process order: convert prices from cents, calculate total order amount
    const processedOrderItems = order.orderItems.map(item => ({
      ...item,
      price: item.price / 100, // Convert price from cents to float
    }));

    const totalAmountCents = order.orderItems.reduce((sum, item) => sum + (item.price * item.count), 0);
    const totalAmountFloat = totalAmountCents / 100;

    const responseOrder = {
      ...order,
      orderItems: processedOrderItems,
      totalAmount: totalAmountFloat, // Add calculated total to the response
    };

    log('INFO', `Fetched order details for orderId: ${orderId}, userId: ${userId}`);
    return NextResponse.json(responseOrder, { status: 200 });

  } catch (error) {
    log('SEVERE', `Error fetching order details for orderId: ${orderId}, userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch order details.' }, { status: 500 });
  }
}
