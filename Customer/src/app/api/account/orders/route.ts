// Customer/src/app/api/account/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import { log } from '@/server/application/common/services/logging';
import { z } from 'zod';

// Placeholder for getting user ID
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) return userIdFromHeader;
    log('WARNING', 'getAuthenticatedUserId is a placeholder in orders API. Implement actual auth.');
    return null;
}

const QueryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1').refine(val => val >= 1, { message: "Page must be 1 or greater" }),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10').refine(val => val >= 1 && val <= 100, { message: "Limit must be between 1 and 100" }),
});

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to GET orders: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const queryValidation = QueryParamsSchema.safeParse({
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '10',
  });

  if (!queryValidation.success) {
    log('WARNING', `Invalid query parameters for GET orders for userId ${userId}: ${JSON.stringify(queryValidation.error.flatten().fieldErrors)}`);
    return NextResponse.json({ error: 'Invalid query parameters', details: queryValidation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { page, limit } = queryValidation.data;

  try {
    const ordersData = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        order_status: true,
        payment_status: true,
        delivery_status: true, // Assuming this field exists on the Order model
        orderItems: {
          select: {
            price: true, // Stored in cents
            count: true,
          },
        },
      },
    });

    const totalOrders = await prisma.order.count({ where: { userId } });

    // Process orders to calculate totalAmount for each order
    const processedOrders = ordersData.map(order => {
      const totalAmountCents = order.orderItems.reduce((sum, item) => sum + (item.price * item.count), 0);
      // Ensure orderItems are not included in the final response for the list view if not needed
      // Or include a summary like total item count if desired.
      const { orderItems, ...orderFields } = order;
      return {
        ...orderFields,
        totalAmount: totalAmountCents / 100, // Convert cents to float
        itemCount: orderItems.reduce((sum, item) => sum + item.count, 0), // Example: add total item count
      };
    });

    log('INFO', `Fetched orders page ${page} (limit ${limit}) for userId: ${userId}. Found ${processedOrders.length} orders.`);
    return NextResponse.json({
      orders: processedOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders: totalOrders,
    }, { status: 200 });

  } catch (error) {
    log('SEVERE', `Error fetching orders for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}
