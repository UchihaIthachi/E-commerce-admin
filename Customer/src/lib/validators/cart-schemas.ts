// Customer/src/lib/validators/cart-schemas.ts
import { z } from 'zod';

// Schema for validating individual cart items received from the client for syncing
export const ClientCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required."), // Sanity _id
  name: z.string().min(1, "Product name is required."),
  // slug is not strictly needed for backend cart sync but client might send it
  // slug: z.string().optional(),
  price: z.number().positive("Price must be a positive number."), // Unit price
  // originalPrice: z.number().optional(), // Original unit price, if client sends it
  imageUrl: z.string().url("Invalid image URL.").optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
  variantId: z.string().optional().nullable(), // Sanity variant _key
  variantName: z.string().optional().nullable(), // e.g., "Large / Blue"
  // If your CartItemType on client includes explicit color/size, add them here
  // color: z.string().optional().nullable(),
  // size: z.string().optional().nullable(),
});

// Schema for validating the overall payload for syncing the cart
export const SyncCartSchema = z.object({
  items: z.array(ClientCartItemSchema), // Can be an empty array to clear the cart
});
