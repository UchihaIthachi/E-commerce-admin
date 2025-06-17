// Customer/src/app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/server/infrastructure/clients/prisma'; // Assuming global prisma client
// For custom JWT auth, you might have a helper like:
// import { getUserIdFromRequest } from '@/lib/auth/session-utils';
// Note: The getAuthenticatedUserId function below is a placeholder.
// In a real application, replace it with your actual session/authentication logic
// (e.g., using NextAuth's getServerSession or a custom JWT verification utility).

// --- Zod Schema for Validation ---
const CartItemCheckoutSchema = z.object({
  productId: z.string(), // This is the Sanity _id, will be stored as sanityId in Prisma CartItem
  name: z.string(),
  slug: z.string(), // Not directly stored in Prisma CartItem but good for reference
  price: z.number(), // Unit price at time of checkout
  originalPrice: z.number(), // Not directly stored, but could be useful for discounts applied
  imageUrl: z.string().url().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  quantity: z.number().int().min(1),
  variantId: z.string().optional().nullable(), // Sanity variant _key
  variantName: z.string().optional().nullable(),
  // color: z.string().optional(), // Add if these are separate fields in CartItemType
  // size: z.string().optional(),  // and needed for order processing
});

export const CreateOrderSchema = z.object({
  cartItems: z.array(CartItemCheckoutSchema).min(1, "Cart cannot be empty."),
  shippingAddressId: z.string().cuid().optional(),
  newShippingAddress: z.object({
    fname: z.string().min(1, "First name is required."),
    lname: z.string().min(1, "Last name is required."),
    country: z.string().min(1, "Country is required."),
    phone: z.string().min(1, "Phone number is required."),
    line_1: z.string().min(1, "Address line 1 is required."),
    line_2: z.string().optional().nullable(),
    city: z.string().min(1, "City is required."),
    postal_code: z.string().min(1, "Postal code is required."),
  }).optional(),
  clientTotalAmount: z.number().positive("Total amount must be positive."),
}).refine(data => data.shippingAddressId || data.newShippingAddress, {
  message: "Either an existing shipping address ID or a new shipping address must be provided.",
  path: ["shippingAddressId"],
});
// --- End Zod Schema ---

// Placeholder for getting user ID from session.
// Replace with your actual auth logic (e.g., NextAuth, custom JWT parsing).
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    // Option 1: Example if a middleware sets 'x-user-id' header from a verified JWT
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) return userIdFromHeader;

    // Option 2: If using NextAuth's getServerSession (example, needs your actual authOptions)
    // import { getServerSession } from 'next-auth/next';
    // import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path to your NextAuth options
    // const session = await getServerSession(authOptions);
    // if (session?.user?.id) return session.user.id;

    // Option 3: Custom JWT parsing from Authorization header or cookie
    // This would involve importing your JWT verification logic.
    // For example:
    // const token = request.cookies.get('your_auth_cookie_name')?.value;
    // if (token) {
    //   try {
    //     const decoded = await verifyJwtToken(token); // Your custom verification function
    //     return decoded.userId;
    //   } catch (e) {
    //     console.error("Auth token verification failed:", e);
    //     return null;
    //   }
    // }

    // If no user ID found by any method, return null.
    console.warn("getAuthenticatedUserId is a placeholder. Implement actual user authentication retrieval.");
    // For testing purposes without real auth, you might temporarily return a fixed ID,
    // BUT THIS IS INSECURE AND SHOULD NOT BE USED IN PRODUCTION.
    // return "debug-user-id"; // REMOVE FOR PRODUCTION
    return null;
}


export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
  }

  const validationResult = CreateOrderSchema.safeParse(requestBody);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { cartItems, shippingAddressId, newShippingAddress, clientTotalAmount } = validationResult.data;

  // Server-side calculation of total amount (assuming item.price is unit price)
  const serverCalculatedTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Compare server-calculated total with client-provided total
  // Allow for small floating point discrepancies if necessary, e.g., by checking Math.abs difference
  if (Math.abs(serverCalculatedTotal - clientTotalAmount) > 0.01) {
    console.error(`Total amount mismatch. Client: ${clientTotalAmount}, Server: ${serverCalculatedTotal}. UserID: ${userId}`);
    return NextResponse.json({ error: 'Total amount mismatch. Please verify cart and try again.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found or email missing.' }, { status: 404 });
    }

    let finalAddressId = shippingAddressId;

    if (newShippingAddress) {
      const createdAddress = await prisma.address.create({
        data: {
          ...newShippingAddress,
          userId: userId,
          primary: false,
        },
      });
      finalAddressId = createdAddress.id;
    }

    if (!finalAddressId) {
      // This should ideally be caught by Zod .refine, but as a safeguard:
      return NextResponse.json({ error: 'Shipping address could not be determined.' }, { status: 400 });
    }

    // Ensure the finalAddressId belongs to the user (if it was an existing ID)
    if (shippingAddressId) {
        const addressCheck = await prisma.address.findFirst({
            where: {id: shippingAddressId, userId: userId}
        });
        if (!addressCheck) {
             return NextResponse.json({ error: 'Invalid shipping address ID provided.' }, { status: 400 });
        }
    }

    const order = await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.create({
        data: {
          addressId: finalAddressId!,
          email: user.email!,
          phone: newShippingAddress?.phone || user.phone_1 || 'N/A',
        },
      });

      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          deliveryId: delivery.id,
          payment_method: 'COD', // Cash on Delivery
          payment_status: 'PENDING',
          order_status: 'PENDING', // Initial status
          shipping_method: 'DELIVERY', // Assuming this is the only method for COD
          // totalAmount: serverCalculatedTotal, // This should be on the Order model if you want to store the total directly
                                               // Otherwise, it's derived from CartItems.
                                               // Let's assume the Order model DOES NOT have totalAmount directly for now.
        },
      });

      // Prisma CartItem fields: sanityId, thumbnail, color, size, count, name, price, discount
      // Assuming price in CartItem schema is stored in smallest currency unit (e.g., cents) as an Integer.
      // If it's a Decimal/Float, remove Math.round and *100.
      await tx.cartItem.createMany({
        data: cartItems.map(item => ({
          orderId: newOrder.id,
          sanityId: item.productId,
          name: item.name,
          price: Math.round(item.price * 100), // Convert to cents
          count: item.quantity,
          thumbnail: item.imageUrl || '/placeholder-image.png',
          color: item.variantName?.split('/')[0]?.trim() || item.variantId || 'N/A',
          size: item.variantName?.split('/')[1]?.trim() || 'N/A',
          // discount: 0, // Assuming no discount for now
        })),
      });

      return newOrder;
    });

    // TODO: Send order confirmation email (out of scope for this subtask)
    // TODO: Clear client-side cart (client will do this after successful response)

    return NextResponse.json({ success: true, orderId: order.id, message: 'Order placed successfully!' }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    // ZodError should be caught by safeParse earlier, but this is a fallback.
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data provided.', details: error.errors }, { status: 400 });
    }
    // Handle Prisma-specific errors or other unexpected errors
    // e.g., if (error instanceof Prisma.PrismaClientKnownRequestError) { ... }
    return NextResponse.json({ error: 'Failed to create order. Please try again later.' }, { status: 500 });
  }
}
