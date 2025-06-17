// Customer/src/app/api/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/sanity/client';
import { log } from '@/server/application/common/services/logging'; // Assuming logger is setup
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query cannot be empty.").max(100, "Search query is too long (max 100 characters)."),
  // Example: Add limit if you want to allow client to specify, otherwise use default in searchProducts
  // limit: z.coerce.number().int().min(1).max(50).optional().default(20)
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParam = searchParams.get('q');
  // const limitParam = searchParams.get('limit'); // If you add limit to schema

  const validationResult = searchQuerySchema.safeParse({ q: queryParam /*, limit: limitParam */ });

  if (!validationResult.success) {
    log('INFO', `Invalid product search query: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
    return NextResponse.json(
      { error: 'Invalid search query', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { q /*, limit */ } = validationResult.data; // Extract validated limit if added

  try {
    // Use the validated 'q' and 'limit' (if you implement it)
    const products = await searchProducts(q /*, limit */);

    // searchProducts function already returns [] for no results or errors caught by it.
    // So, an explicit check for !products might be redundant unless it could return undefined/null,
    // which it currently doesn't based on its implementation (it returns []).
    log('INFO', `Product search successful for query "${q}". Found ${products.length} products.`);
    return NextResponse.json({ products }, { status: 200 });

  } catch (error) { // This catch block is for unexpected errors not caught by searchProducts
    log('SEVERE', `Unexpected error in product search API for query "${q}": ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to search products due to an unexpected server error.' }, { status: 500 });
  }
}
