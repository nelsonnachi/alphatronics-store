import { z } from "zod";

// ============================================================
// ADD CART ITEM
// ============================================================

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),

  variantId: z.string().uuid().optional(),

  quantity: z.number().int().positive().max(50),
});

// ============================================================
// UPDATE CART ITEM
// ============================================================

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(50),
});

export type AddCartItemValidation = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemValidation = z.infer<typeof updateCartItemSchema>;
