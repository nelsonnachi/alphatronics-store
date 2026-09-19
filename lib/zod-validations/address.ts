import { z } from "zod";

export const addressSchema = z.object({
  type: z.enum(["shipping", "billing"]).default("shipping"),

  fullName: z.string().trim().min(2).max(120),

  phone: z.string().trim().min(6).max(20),

  email: z.string().trim().email().optional(),

  addressLine1: z.string().trim().min(3).max(200),

  addressLine2: z.string().trim().max(200).optional(),

  city: z.string().trim().min(1).max(100),

  state: z.string().trim().min(1).max(100),

  postalCode: z.string().trim().min(2).max(20),

  country: z.string().trim().min(2).max(100),

  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.partial();

export type AddressValidation = z.infer<typeof addressSchema>;
export type UpdateAddressValidation = z.infer<typeof updateAddressSchema>;