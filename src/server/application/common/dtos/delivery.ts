import { z } from "zod";
import { GetAddressDTO } from "./address";

export const GetDeliveryDTO = z.object({
  address: GetAddressDTO,
  phone: z.string(),
  service: z.string().nullable(),
  email: z.string(),
  gift: z.boolean(),
  boxed: z.boolean(),
  wrapped: z.boolean(),
  message: z.string().nullable(),
});
