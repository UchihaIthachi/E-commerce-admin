import { router, publicProcedure } from '../../trpc'; // Assuming publicProcedure for now, adjust if auth is needed
import { z } from 'zod';
import getBannersQueryHandler from '@/server/application/features/banner/queries/get-banners-query-handler';
import getBannerQueryHandler from '@/server/application/features/banner/queries/get-banner-query-handler';
import createBannerCommandHandler from '@/server/application/features/banner/commands/create-banner-command-handler';
import updateBannerCommandHandler from '@/server/application/features/banner/commands/update-banner-command-handler';
// Assuming a delete banner command handler exists or will be created:
// import deleteBannerCommandHandler from '@/server/application/features/banner/commands/delete-banner-command-handler';
import { AddBannerDTO, EditBannerDTO, GetBannerDTO } from '@/server/application/common/dtos/banner';

export const adminBannerRouter = router({
  getAll: publicProcedure
    .output(z.array(GetBannerDTO)) // Ensure output validation
    .query(async () => {
      const banners = await getBannersQueryHandler();
      return banners;
    }),

  getById: publicProcedure
    .input(z.object({ _id: z.string() }))
    .output(GetBannerDTO) // Ensure output validation
    .query(async ({ input }) => {
      const banner = await getBannerQueryHandler({ _id: input._id });
      // Handle case where banner might not be found if getBannerQueryHandler can return null/undefined
      if (!banner) {
        throw new Error('Banner not found'); // Or a specific tRPCError
      }
      return banner;
    }),

  create: publicProcedure
    .input(AddBannerDTO)
    .mutation(async ({ input }) => {
      // Assuming createBannerCommandHandler doesn't return significant data or handles errors by throwing
      await createBannerCommandHandler(input);
      return { success: true, message: 'Banner created successfully' }; // Or return the created banner
    }),

  update: publicProcedure
    .input(EditBannerDTO.extend({ _id: z.string() })) // Add _id to the DTO for input
    .mutation(async ({ input }) => {
      const { _id, ...dataToUpdate } = input;
      await updateBannerCommandHandler({ _id, ...dataToUpdate });
      return { success: true, message: 'Banner updated successfully' };
    }),

  // delete: publicProcedure
  //   .input(z.object({ _id: z.string() }))
  //   .mutation(async ({ input }) => {
  //     // await deleteBannerCommandHandler(input._id);
  //     // For now, as delete handler might not exist:
  //     console.warn(`Mock delete for banner ${input._id}. Implement actual delete handler.`);
  //     return { success: true, message: 'Banner (mock) deleted successfully' };
  //   }),
});
