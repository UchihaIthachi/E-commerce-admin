import { router, publicProcedure } from '../../trpc';
import { z } from 'zod';
import getSizesQueryHandler from '@/server/application/features/size/queries/get-sizes-query-handler';
import getSizeQueryHandler from '@/server/application/features/size/queries/get-size-query-handler';
import createSizeCommandHandler from '@/server/application/features/size/commands/create-size-command-handler';
import updateSizeCommandHandler from '@/server/application/features/size/commands/update-size-command-handler';
import deleteSizeCommandHandler from '@/server/application/features/size/commands/delete-size-command-handler';
import { AddSizeDTO, EditSizeDTO, GetSizeDTO } from '@/server/application/common/dtos/size'; // Assuming DTO names

export const adminSizeRouter = router({
  getAll: publicProcedure
    .output(z.array(GetSizeDTO))
    .query(async () => {
      const sizes = await getSizesQueryHandler();
      return sizes;
    }),

  getById: publicProcedure
    .input(z.object({ _id: z.string() }))
    .output(GetSizeDTO)
    .query(async ({ input }) => {
      const size = await getSizeQueryHandler(input._id); // Assuming handler takes id directly
      if (!size) {
        throw new Error('Size not found'); // Or a specific tRPCError
      }
      return size;
    }),

  create: publicProcedure
    .input(AddSizeDTO)
    .output(GetSizeDTO) // Assuming create handler returns the created object
    .mutation(async ({ input }) => {
      const newSize = await createSizeCommandHandler(input);
      if (!newSize) throw new Error("Could not create or retrieve size after creation.");
      return newSize;
    }),

  update: publicProcedure
    .input(EditSizeDTO.extend({ _id: z.string() })) // Assuming EditSizeDTO doesn't have _id
    .output(GetSizeDTO) // Assuming update handler returns the updated object
    .mutation(async ({ input }) => {
      const { _id, ...dataToUpdate } = input;
      const updatedSize = await updateSizeCommandHandler({ _id, ...dataToUpdate });
      if (!updatedSize) throw new Error("Could not update or retrieve size after update.");
      return updatedSize;
    }),

  delete: publicProcedure
    .input(z.object({ _id: z.string() }))
    .output(z.object({ _id: z.string(), success: z.boolean() }))
    .mutation(async ({ input }) => {
      await deleteSizeCommandHandler(input._id); // Assuming handler takes id directly
      return { _id: input._id, success: true };
    }),
});
