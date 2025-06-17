import { router, protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import getGridItemsQueryHandler from '@/server/application/features/grid-item/query/get-grid-items-query-handler';
import getGridItemQueryHandler from '@/server/application/features/grid-item/query/get-grid-item-query-handler';
// import createGridItemCommandHandler from '@/server/application/features/grid-item/commands/create-grid-item-command-handler.ts'; // Now called by Server Action
// import updateGridItemCommandHandler from '@/server/application/features/grid-item/commands/update-grid-item-command-handler.ts'; // Now called by Server Action
import { GetGridItemDTO } from '@/server/application/common/dtos/grid-item'; // Removed Add/Edit DTOs
import { TRPCError } from '@trpc/server';

export const adminGridItemRouter = router({
  getAll: protectedProcedure
    .output(z.array(GetGridItemDTO))
    .query(async ({ ctx }) => {
      const gridItems = await getGridItemsQueryHandler();
      return gridItems;
    }),

  getById: protectedProcedure
    .input(z.object({ _id: z.string() }))
    .output(GetGridItemDTO)
    .query(async ({ input, ctx }) => {
      const gridItem = await getGridItemQueryHandler(input._id);
      if (!gridItem) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Grid Item not found' });
      }
      return gridItem;
    }),

  // create, update, deleteById mutations are now handled by Server Actions.
});
