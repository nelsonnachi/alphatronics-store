import { z } from "zod";

export const adminPaymentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  status: z.enum(["pending", "paid", "failed", "partially_refunded", "refunded"]).optional(),

  method: z.enum(["card", "bank_transfer", "cash_on_delivery"]).optional(),

  provider: z.string().trim().optional(),

  search: z.string().trim().optional(),
});

export type AdminPaymentQueryValidation = z.infer<
  typeof adminPaymentQuerySchema
>;
