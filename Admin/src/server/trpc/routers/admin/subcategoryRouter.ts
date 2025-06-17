import { router, protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import getSubCategoriesQueryHandler from '@/server/application/features/subcategory/queries/get-subcategories-query-handler';
import getSubCategoryQueryHandler from '@/server/application/features/subcategory/queries/get-subcategory-query-handler';
import { findSubCategoryBySlug } from '@/server/infrastructure/repositories/group/subcategory-repository';
import { GetSubCategoryDTO, GetSubCategoriesDTO } from '@/server/application/common/dtos/subcategory'; // Removed mutation DTOs
import { TRPCError } from '@trpc/server';
import { graphqlClient } from '@/server/infrastructure/clients/graphqlClient'; // For getByCategoryId

// Mutation command handlers are no longer called directly by tRPC, but by Server Actions
// import createSubCategoryCommandHandler from '@/server/application/features/subcategory/commands/create-subcategory-command-handler';
// import updateSubCategoryCommandHandler from '@/server/application/features/subcategory/commands/update-subcategory-command-handler';
// import deleteSubCategoryCommandHandler from '@/server/application/features/subcategory/commands/delete-subcategory-command-handler';


export const adminSubCategoryRouter = router({
  getAll: protectedProcedure
    .output(z.array(GetSubCategoriesDTO))
    .query(async ({ ctx }) => {
      const subcategories = await getSubCategoriesQueryHandler();
      return subcategories;
    }),

  getById: protectedProcedure
    .input(z.object({ _id: z.string() }))
    .output(GetSubCategoryDTO)
    .query(async ({ input, ctx }) => {
      const subcategory = await getSubCategoryQueryHandler(input._id);
      if (!subcategory) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subcategory not found' });
      }
      return subcategory;
    }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .output(GetSubCategoryDTO.nullable())
    .query(async ({ input, ctx }) => {
      const subcategory = await findSubCategoryBySlug(input.slug);
      return subcategory;
    }),

  getByCategoryId: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .output(z.array(GetSubCategoriesDTO))
    .query(async ({ input, ctx }) => {
      const query = `
        query GetSubcategoriesByCategoryId($categoryId: ID!) {
          allSubcategory(where: { category: { _id: { eq: $categoryId } } }) {
            _id
            name
            slug {
              current
            }
            category {
              _id
              name
            }
          }
        }
      `;
      const variables = { categoryId: input.categoryId };
      try {
        const response = await graphqlClient.request(query, variables);
        const subcategories = response.allSubcategory.map((item: any) => ({
          ...item,
          slug: item.slug?.current || "",
        }));
        return GetSubCategoriesDTO.array().parse(subcategories);
      } catch (error) {
        console.error(`Error fetching subcategories for category ID "${input.categoryId}":`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch subcategories for the given category',
        });
      }
    }),

  // Mutations are now handled by Server Actions
  // create: protectedProcedure ...
  // update: protectedProcedure ...
  // delete: protectedProcedure ...
});
