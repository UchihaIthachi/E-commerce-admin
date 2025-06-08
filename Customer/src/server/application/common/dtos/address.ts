import { z } from "zod";

export const GetAddressDTO = z.object({
  fname: z.string(),
  lname: z.string(),
  line_1: z.string(),
  line_2: z.string(),
  city: z.string(),
  country: z.string(),
  postal_code: z.string(),
  phone: z.string(),
});
