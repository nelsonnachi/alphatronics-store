import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and hyphen-separated"
    ),

  description: z.string().trim().max(500).optional(),

  imageUrl: z.string().trim().url().optional(),

  icon: z.string().trim().optional(),

  parentId: z.string().uuid().nullable().optional(),

  displayOrder: z.coerce.number().int().min(0).default(0),

  isFeatured: z.boolean().default(false),

  metaTitle: z.string().trim().max(160).optional(),

  metaDescription: z.string().trim().max(300).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateCategoryValidation = z.infer<typeof createCategorySchema>;

export type UpdateCategoryValidation = z.infer<typeof updateCategorySchema>;
