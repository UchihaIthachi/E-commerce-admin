import { z } from "zod";
import {GetAddressDTO} from "@/server/application/common/dtos/address";

export const GetPickupDTO = z.object({
  store: z.string(),
  address:GetAddressDTO,
  phone: z.string(),
  email: z.string(),
  gift: z.boolean(),
  boxed: z.boolean(),
  wrapped: z.boolean(),
  message: z.string().nullable(),
});
