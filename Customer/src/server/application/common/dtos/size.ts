import { z } from "zod";

export const GetSizeDTO = z
  .object({ _id: z.string(), name: z.string() })
  .strict();

export const AddSizeDTO = z
  .object({ name: z.string() })
  .strict();

export const EditSizeDTO = z
  .object({  name: z.string() })
  .strict();