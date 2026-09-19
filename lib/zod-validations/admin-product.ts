import { z } from "zod";


export const adminProductToggleSchema = z
  .object({
    isFeatured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one product field must be provided",
    },
  );


export type AdminProductToggleValidation = z.infer<typeof adminProductToggleSchema>;