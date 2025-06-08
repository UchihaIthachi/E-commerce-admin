import { z } from "zod";

export const GetColorDTO = z
  .object({ _id: z.string(), name: z.string(), hex: z.string() })
  .strict();

export const AddColorDTO = z
  .object({ name: z.string(), hex: z.string() })
  .strict();

export const EditColorDTO = z
  .object({  name: z.string(), hex: z.string() })
  .strict();