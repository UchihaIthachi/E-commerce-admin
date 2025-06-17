import { router, protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import getCategoriesQueryHandler from '@/server/application/features/category/queries/get-categories-query-handler';
import getCategoryQueryHandler from '@/server/application/features/category/queries/get-category-query-handler';
import { findCategoryBySlug } from '@/server/infrastructure/repositories/group/category-repository'; // Import repository function
import { GetCategoriesDTO, GetCategoryDTO } from '@/server/application/common/dtos/category';
import { TRPCError } from '@trpc/server';

// Re-defining DTOs here to avoid modifying category-repository.ts again in this subtask.
// Ideally, these should live in a common DTO file.
const SubcategoryLiteDTOSchema = z.object({ // Renamed to avoid conflict if imported elsewhere
  _id: z.string(),
  name: z.string().nullable().optional(),
  slug: z.object({ current: z.string() }).nullable().optional(),
});

const CategoryWithSubcategoriesDTOSchema = GetCategoryDTO.extend({
  subcategories: z.array(SubcategoryLiteDTOSchema).optional().nullable(),
});


export const adminCategoryRouter = router({
  getAll: protectedProcedure
    .output(z.array(GetCategoriesDTO)) // GetCategoriesDTO is already an array item schema
    .query(async ({ ctx }) => {
      const categories = await getCategoriesQueryHandler();
      return categories;
    }),

  getById: protectedProcedure
    .input(z.object({ _id: z.string() }))
    .output(GetCategoryDTO)
    .query(async ({ input, ctx }) => {
      const category = await getCategoryQueryHandler(input._id);
      if (!category) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });
      }
      return category;
    }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .output(CategoryWithSubcategoriesDTOSchema.nullable()) // Output can be the category or null
    .query(async ({ input, ctx }) => {
      const category = await findCategoryBySlug(input.slug); // Direct call to repository function
      if (!category) {
        // findCategoryBySlug already returns null if not found, so just return it.
        // Or throw TRPCError if that's preferred for slug lookups. For now, align with repo.
        return null;
      }
      return category;
    }),
});
