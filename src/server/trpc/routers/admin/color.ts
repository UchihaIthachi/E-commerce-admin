import { router, publicProcedure } from '../../trpc';
import { z } from 'zod';
import getColorsQueryHandler from '@/server/application/features/color/queries/get-colors-query-handler';
import getColorQueryHandler from '@/server/application/features/color/queries/get-color-query-handler';
import createColorCommandHandler from '@/server/application/features/color/commands/create-color-command-handler';
import updateColorCommandHandler from '@/server/application/features/color/commands/update-color-command-handler';
import deleteColorCommandHandler from '@/server/application/features/color/commands/delete-color-command-handler';
import { AddColorDTO, EditColorDTO, GetColorDTO } from '@/server/application/common/dtos/color'; // Assuming DTO names

export const adminColorRouter = router({
  getAll: publicProcedure
    .output(z.array(GetColorDTO))
    .query(async () => {
      const colors = await getColorsQueryHandler();
      return colors;
    }),

  getById: publicProcedure
    .input(z.object({ _id: z.string() }))
    .output(GetColorDTO)
    .query(async ({ input }) => {
      const color = await getColorQueryHandler(input._id);
      if (!color) {
        throw new Error('Color not found'); // Or a specific tRPCError
      }
      return color;
    }),

  create: publicProcedure
    .input(AddColorDTO)
    .output(GetColorDTO) // Assuming create handler might return the created object or use GetColorDTO for consistency
    .mutation(async ({ input }) => {
      // Assuming createColorCommandHandler might return the created color or an ID
      // For now, let's assume it might return the created color matching GetColorDTO
      // If it doesn't return, adjust output or how data is returned/refetched.
      const newColor = await createColorCommandHandler(input);
      // If your handler doesn't return the full object, you might need to fetch it:
      // const newColor = await getColorQueryHandler(newlyCreatedId);
      // For now, assuming it returns something compatible or we adjust client refetching.
      // Let's assume it returns the created color object. If not, this needs adjustment.
      if (!newColor) throw new Error("Could not create or retrieve color after creation.");
      return newColor;
    }),

  update: publicProcedure
    .input(EditColorDTO.extend({ _id: z.string() })) // Assuming EditColorDTO doesn't have _id
    .output(GetColorDTO) // Assuming update handler might return the updated object
    .mutation(async ({ input }) => {
      const { _id, ...dataToUpdate } = input;
      // Assuming updateColorCommandHandler might return the updated color
      const updatedColor = await updateColorCommandHandler({ _id, ...dataToUpdate });
      if (!updatedColor) throw new Error("Could not update or retrieve color after update.");
      return updatedColor;
    }),

  delete: publicProcedure
    .input(z.object({ _id: z.string() }))
    .output(z.object({ _id: z.string(), success: z.boolean() })) // Example output
    .mutation(async ({ input }) => {
      await deleteColorCommandHandler(input._id); // Assuming this takes just id
      return { _id: input._id, success: true };
    }),
});
