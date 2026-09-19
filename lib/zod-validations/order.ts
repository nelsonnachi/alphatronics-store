import { z } from "zod";

/**
 * CHECKOUT
 *
 * The customer only sends information needed
 * to start checkout.
 *
 * The server calculates:
 * - subtotal
 * - discount
 * - shipping
 * - tax
 * - total
 * - payment status
 * - inventory
 */
export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid(),

  billingAddressId: z.string().uuid().optional(),

  paymentMethod: z.enum(["card", "bank_transfer", "cash_on_delivery"]),

  couponCode: z.string().trim().max(50).optional(),

  customerNote: z.string().trim().max(500).optional(),

  shippingOption: z
    .enum(["standard", "express", "overnight"])
    .default("standard"),
});

/**
 * ADMIN ORDER STATUS
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
    "failed",
  ]),

  trackingNumber: z.string().trim().max(100).optional(),

  carrier: z.string().trim().max(100).optional(),

  adminNote: z.string().trim().max(1000).optional(),
});

/**
 * ORDER LIST QUERY
 */
export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  status: z
    .enum([
      "pending",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
      "failed",
    ])
    .optional(),
});

export type CheckoutValidation = z.infer<typeof checkoutSchema>;

export type UpdateOrderStatusValidation = z.infer<
  typeof updateOrderStatusSchema
>;

export type OrderQueryValidation = z.infer<typeof orderQuerySchema>;
