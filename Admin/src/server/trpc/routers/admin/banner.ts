import { router, protectedProcedure } from '../../trpc'; // Changed to protectedProcedure
import { z } from 'zod';
import getBannersQueryHandler from '@/server/application/features/banner/queries/get-banners-query-handler';
import getBannerQueryHandler from '@/server/application/features/banner/queries/get-banner-query-handler';
import createBannerCommandHandler from '@/server/application/features/banner/commands/create-banner-command-handler';
import updateBannerCommandHandler from '@/server/application/features/banner/commands/update-banner-command-handler';
// Assuming a delete banner command handler exists or will be created:
// import deleteBannerCommandHandler from '@/server/application/features/banner/commands/delete-banner-command-handler';
import { GetBannerDTO } from '@/server/application/common/dtos/banner'; // Removed AddBannerDTO, EditBannerDTO
// Command Handlers are now called by Server Actions
// import createBannerCommandHandler from '@/server/application/features/banner/commands/create-banner-command-handler';
// import updateBannerCommandHandler from '@/server/application/features/banner/commands/update-banner-command-handler';
// import deleteBannerCommandHandler from '@/server/application/features/banner/commands/delete-banner-command-handler';


export const adminBannerRouter = router({
  getAll: protectedProcedure
    .output(z.array(GetBannerDTO))
    .query(async ({ ctx }) => {
      const banners = await getBannersQueryHandler();
      return banners;
    }),

  getById: protectedProcedure
    .input(z.object({ _id: z.string() }))
    .output(GetBannerDTO)
    .query(async ({ input, ctx }) => {
      const banner = await getBannerQueryHandler(input._id);
      if (!banner) {
        throw new Error('Banner not found'); // Or a specific tRPCError
      }
      return banner;
    }),

  // Mutations (create, update, delete) are now handled by Server Actions.
  // create: protectedProcedure ...
  // update: protectedProcedure ...
  // delete: protectedProcedure ...
});
