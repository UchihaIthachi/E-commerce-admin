import { router, protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { graphqlClient } from '@/server/infrastructure/clients/graphqlClient'; // For getAll and getById

// DTOs from common/dtos/cloth.ts
import { AddProductDTO, EditProductDTO, GetClothFormDTO } from '@/server/application/common/dtos/cloth';

// Command Handlers
import createProductCommandHandler from '@/server/application/features/product/commands/create-product-command';
import editProductCommandHandler from '@/server/application/features/product/commands/edit-product-command-handler';
// Missing: deleteProductCommandHandler

// Simplified DTO for product list items (redefined from previous cloth.ts refactor)
const ProductListItemDTO = z.object({
  _id: z.string(),
  name: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  discount: z.number().nullable().optional(),
  category: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
  subcategory: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
  enabled: z.boolean().nullable().optional(),
});
export type ProductListItem = z.infer<typeof ProductListItemDTO>;

export const adminProductRouter = router({
  getAll: protectedProcedure
    // TODO: Add input schema for filters if needed (e.g., category, status)
    .output(z.array(ProductListItemDTO))
    .query(async ({ ctx }) => {
      const query = `
        query AllProducts {
          allCloth { # Assuming 'Cloth' is the Sanity type for products
            _id
            name
            sku
            price
            discount
            category {
              name
            }
            subcategory {
              name
            }
            enabled
          }
        }
      `;
      try {
        const response = await graphqlClient.request(query);
        // Ensure the response structure matches expectations, e.g., response.allCloth
        if (!response.allCloth) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Invalid response from product data source' });
        }
        return ProductListItemDTO.array().parse(response.allCloth);
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch products.',
          cause: error,
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ _id: z.string() }))
    .output(GetClothFormDTO) // Using the detailed DTO for a single product
    .query(async ({ input, ctx }) => {
      const query = `
        query GetProductById($id: ID!) {
          Cloth(id: $id) { # Assuming 'Cloth' is the Sanity type
            _id
            enabled
            name
            sku
            description
            price
            discount
            category { _id name } # Fetch enough category data
            subcategory { _id name } # Fetch enough subcategory data
            seo { title description } # Simplified SEO for now
            variants { _id color { _id name } size { _id name } stock }
            media { _id images color { _id name } default }
          }
        }
      `;
      // Note: The GetClothFormDTO expects category & subcategory to be just strings (IDs).
      // The GraphQL query above fetches objects. A transformation step will be needed.
      // Also, 'default' in media needs aliasing to 'isDefault' if DTO expects that.
      try {
        const response = await graphqlClient.request(query, { id: input._id });
        if (!response.Cloth) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }

        // Transformation to match GetClothFormDTO
        const rawCloth = response.Cloth;
        const transformedCloth = {
          ...rawCloth,
          category: rawCloth.category?._id, // Extract ID
          subcategory: rawCloth.subcategory?._id, // Extract ID
          media: rawCloth.media?.map((m: any) => ({ ...m, isDefault: m.default })), // Alias default
          // Ensure variants, colors, sizes within variants also match DTO structure (e.g. color._id)
          variants: rawCloth.variants?.map((v: any) => ({
            ...v,
            color: v.color?._id,
            size: v.size?._id,
          })),
        };
        return GetClothFormDTO.parse(transformedCloth);
      } catch (error: any) {
        if (error instanceof TRPCError && error.code === 'NOT_FOUND') throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch product details.',
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(AddProductDTO)
    // Assuming createProductCommandHandler returns something identifiable or just success
    .output(z.object({ success: z.boolean(), message: z.string() /*, id: z.string().optional() */ }))
    .mutation(async ({ input, ctx }) => {
      try {
        // createProductCommandHandler is from create-product-command.ts (not .tsx)
        // It's not clear what this handler returns. Assuming void for now.
        await createProductCommandHandler(input);
        return { success: true, message: 'Product created successfully.' };
      } catch (error: any) {
        throw new TRPCError({
          code: error.name === 'VALIDATION_ERROR' ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create product.',
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(EditProductDTO) // EditProductDTO already includes _id
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // editProductCommandHandler is from edit-product-command-handler.ts
        // Assuming it takes the full EditProductDTO (including _id)
        await editProductCommandHandler(input);
        return { success: true, message: 'Product updated successfully.' };
      } catch (error: any) {
        throw new TRPCError({
          code: error.name === 'VALIDATION_ERROR' ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update product.',
          cause: error,
        });
      }
    }),

  // deleteById: protectedProcedure
  //   .input(z.object({ _id: z.string() }))
  //   .output(z.object({ success: z.boolean(), message: z.string() }))
  //   .mutation(async ({ input, ctx }) => {
  //     // No deleteProductCommandHandler identified.
  //     // throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Delete product functionality not implemented.' });
  //     return { success: false, message: 'Delete functionality pending handler.' }; // Placeholder
  //   }),
});
