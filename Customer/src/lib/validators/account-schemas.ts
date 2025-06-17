// Customer/src/lib/validators/account-schemas.ts
import { z } from 'zod';

export const AddressSchema = z.object({
  fname: z.string().min(1, "First name is required."),
  lname: z.string().min(1, "Last name is required."),
  country: z.string().min(1, "Country is required."),
  phone: z.string().min(1, "Phone number is required.")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format."), // Basic E.164-like regex
  line_1: z.string().min(1, "Address line 1 is required."),
  line_2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required."),
  postal_code: z.string().min(1, "Postal code is required."),
  primary: z.boolean().optional().default(false),
});

// Optional: If you need a schema for just the ID for params validation (can also be done inline)
export const AddressIdSchema = z.object({
  addressId: z.string().cuid("Invalid address ID format."),
});
