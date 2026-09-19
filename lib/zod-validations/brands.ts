import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().trim().min(1).max(100),

  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and hyphen-separated",
    ),

  logoUrl: z.string().trim().url().optional(),

  description: z.string().trim().max(500).optional(),

  website: z.string().trim().url().optional(),
});

export const updateBrandSchema = createBrandSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateBrandValidation = z.infer<typeof createBrandSchema>;

export type UpdateBrandValidation = z.infer<typeof updateBrandSchema>;