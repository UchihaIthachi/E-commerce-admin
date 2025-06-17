// Customer/src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/infrastructure/clients/prisma';
import { SyncCartSchema, ClientCartItemSchema } from '@/lib/validators/cart-schemas'; // Assuming this path
import { log } from '@/server/application/common/services/logging';
import type { CartItemType } from '@/store/useCartStore'; // For structuring the GET response

// Placeholder for getting user ID from session.
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) return userIdFromHeader;
    log('WARNING', 'getAuthenticatedUserId is a placeholder in cart API. Implement actual auth.');
    return null;
}

// GET /api/cart - Fetch user's cart from DB
export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to GET cart: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          orderBy: { // Optional: order items consistently
            createdAt: 'asc'
          }
        }
      },
    });

    if (!dbCart || !dbCart.cartItems || dbCart.cartItems.length === 0) {
      log('INFO', `No persistent cart found or cart is empty for userId: ${userId}.`);
      return NextResponse.json({ cart: [] }, { status: 200 });
    }

    // Map Prisma CartItems to client-side CartItemType structure
    const clientCartItems: CartItemType[] = dbCart.cartItems.map(item => {
      // Prisma CartItem fields: id, cartId, sanityId, name, thumbnail, color, size, count, price (cents)
      // Client CartItemType: cartItemId, productId, name, slug, price (float), originalPrice, imageUrl, imageAlt, quantity, variantId, variantName

      // Construct cartItemId (example: productId_variantKey or productId_color_size)
      // For now, using a simpler approach. This needs to align with how client store generates it.
      // The client store uses productId_variantId or productId.
      // We don't store variantId directly in CartItem, but use color/size.
      // This mapping might need refinement based on how unique items are defined.
      // Let's assume sanityId is product's Sanity _id.
      // And color/size from DB define the variant.
      const variantIdPart = (item.color !== 'N/A' || item.size !== 'N/A')
                            ? `_${item.color}_${item.size}` // This is an assumption for variant representation
                            : '';
      const cartItemId = `${item.sanityId}${variantIdPart}`;

      // Construct variantName
      let variantName: string | undefined = undefined;
      if (item.color !== 'N/A' && item.size !== 'N/A') {
        variantName = `${item.color} / ${item.size}`;
      } else if (item.color !== 'N/A') {
        variantName = item.color;
      } else if (item.size !== 'N/A') {
        variantName = item.size;
      }

      // Note: `slug` and `originalPrice` are not stored in Prisma's CartItem.
      // Client will need to fetch these from product details if strictly needed after hydration,
      // or this GET response is primarily for re-populating quantities of known items.
      // For now, we'll omit them or use placeholders if the type demands.
      // DB stores UNIT price in cents. Client CartItemType expects UNIT price as float.
      return {
        cartItemId: cartItemId,
        productId: item.sanityId,
        name: item.name,
        slug: '', // Placeholder - not stored in DB CartItem. Client might need to fetch this if displaying links from hydrated cart.
        price: item.price / 100, // Convert UNIT price from cents to float
        originalPrice: item.price / 100, // Placeholder: Assume DB unit price is original. If discounts applied, this needs actual original price.
        imageUrl: item.thumbnail,
        imageAlt: item.name,
        quantity: item.count,
        variantId: variantIdPart || undefined,
        variantName: variantName,
      };
    });

    log('INFO', `Fetched persistent cart for userId: ${userId} with ${clientCartItems.length} distinct items.`);
    return NextResponse.json({ cart: clientCartItems }, { status: 200 });

  } catch (error) {
    log('SEVERE', `Error fetching cart for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch cart.' }, { status: 500 });
  }
}


// POST /api/cart - Sync client cart to DB
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    log('WARNING', 'Unauthorized attempt to POST (sync) cart: No user ID.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    log('WARNING', `Invalid JSON input for POST cart for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
  }

  const validationResult = SyncCartSchema.safeParse(requestBody);
  if (!validationResult.success) {
    log('WARNING', `Cart sync validation failed for userId: ${userId}: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
    return NextResponse.json(
      { error: 'Invalid cart data', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { items: clientCartItems } = validationResult.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Find or create the user's Cart
      const cart = await tx.cart.upsert({
        where: { userId },
        update: {}, // No fields to update on Cart itself in this operation
        create: { userId },
        select: { id: true } // Select only the cartId
      });
      const cartId = cart.id;

      // 2. Delete all existing CartItems associated with this cartId
      await tx.cartItem.deleteMany({
        where: { cartId },
      });

      // 3. If the client sent items, create new CartItems
      if (clientCartItems && clientCartItems.length > 0) {
        const itemsToCreate = clientCartItems.map(item => {
          // Parse color and size from variantName or use defaults for DB
          // Prisma schema requires color and size to be non-null strings.
          let color = 'N/A';
          let size = 'N/A';
          if (item.variantName) {
            const parts = item.variantName.split(' / ');
            if (parts.length === 2) {
              color = parts[0].trim() || 'N/A';
              size = parts[1].trim() || 'N/A';
            } else if (parts.length === 1 && parts[0].trim() !== '') {
              // Could be color or size, try to infer or have client send explicitly
              // For simplicity, if only one part, assume it's a general variant name, not specific color/size
              // Or, if your client CartItemType has explicit color/size fields, use those.
              // For now, if variantName doesn't fit "Color / Size", both might remain "N/A" unless item.color/size exist on payload
               if (item.variantName.match(/S|M|L|XL|XXL/i)) size = item.variantName.trim(); // Basic size guess
               else color = item.variantName.trim(); // Assume color otherwise
            }
          }
          // If item has explicit color/size fields from ClientCartItemSchema, use them:
          // color = item.color || color;
          // size = item.size || size;


          return {
            cartId: cartId,
            sanityId: item.productId,
            name: item.name,
            price: Math.round(item.price * 100), // Store unit price in cents
            count: item.quantity,
            thumbnail: item.imageUrl || '/placeholder-image.png',
            color: color, // Ensure this is non-null
            size: size,   // Ensure this is non-null
            // discount: 0, // Assuming no discount for now
          };
        });
        await tx.cartItem.createMany({
          data: itemsToCreate,
        });
        log('INFO', `Synced ${itemsToCreate.length} items to persistent cart for userId: ${userId}.`);
      } else {
        log('INFO', `Client cart was empty. Cleared persistent cart for userId: ${userId}.`);
      }
    });

    return NextResponse.json({ success: true, message: 'Cart synced successfully.' }, { status: 200 });

  } catch (error) {
    log('SEVERE', `Error syncing cart for userId: ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to sync cart.' }, { status: 500 });
  }
}
