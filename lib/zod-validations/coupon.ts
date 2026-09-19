import { z } from "zod";


// Schema for validating a coupon request.
export const couponValidationSchema = z.object({
  code: z.string().min(1),
  subtotal: z.coerce.number().positive(),
});


export type CouponValidation =  z.infer<typeof couponValidationSchema>;