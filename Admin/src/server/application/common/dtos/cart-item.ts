import { z } from "zod";

export const GetCartItemDTO = z.object({
  id: z.string(),
  name: z.string(),
  sanityId: z.string(),
  color: z.string(),
  size: z.string(),
  price: z.number(),
  count: z.number(),
});
