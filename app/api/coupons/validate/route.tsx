import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";

import { coupons, orders } from "@/db/schema";

import { and, count, eq } from "drizzle-orm";

import { requireUser } from "@/lib/APIs/auth";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { couponValidationSchema } from "@/lib/zod-validations/coupon";

// ============================================================
// POST /api/coupons/validate
//
// Checks whether a coupon can currently be used.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // ========================================================
    // 1. REQUIRE LOGIN
    // ========================================================

    const user = await requireUser();

    // ========================================================
    // 2. VALIDATE REQUEST
    // ========================================================

    const { code, subtotal } = couponValidationSchema.parse(await req.json());

    // Convert coupon code to uppercase.
    //
    // Example:
    //
    // save10
    //
    // becomes:
    //
    // SAVE10
    const couponCode = code.toUpperCase();

    // ========================================================
    // 3. FIND COUPON
    // ========================================================

    const coupon = await db.query.coupons.findFirst({
      where: {
        code: couponCode,
      },
    });

    if (!coupon || !coupon.isActive) {
      throw new ApiError("Invalid coupon code", 404);
    }

    // ========================================================
    // 4. CHECK DATES
    // ========================================================

    const now = new Date();

    // Coupon hasn't started yet.
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new ApiError("This coupon is not active yet", 400);
    }

    // Coupon has expired.
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new ApiError("This coupon has expired", 400);
    }

    // ========================================================
    // 5. CHECK GLOBAL USAGE LIMIT
    // ========================================================

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError("This coupon has reached its usage limit", 400);
    }

    // ========================================================
    // 6. CHECK MINIMUM PURCHASE
    // ========================================================

    const minimumPurchase = Number(coupon.minPurchase);

    if (subtotal < minimumPurchase) {
      throw new ApiError(
        `Minimum purchase of ₦${coupon.minPurchase} required for this coupon`,
        400,
      );
    }

    // ========================================================
    // 7. CHECK USER'S PREVIOUS USAGE
    // ========================================================

    const usageResult = await db
      .select({
        count: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.userId, user.id),

          eq(orders.couponId, coupon.id),
        ),
      );

    const userUsage = usageResult[0]?.count ?? 0;

    if (userUsage >= coupon.perUserLimit) {
      throw new ApiError(
        "You've already used this coupon the maximum number of times",
        400,
      );
    }

    // ========================================================
    // 8. CALCULATE DISCOUNT
    // ========================================================

    let discount: number;

    // Percentage coupon.
    //
    // Example:
    //
    // subtotal = ₦100,000
    // discount = 10%
    //
    // discount = ₦10,000
    if (coupon.discountType === "percentage") {
      discount = (subtotal * Number(coupon.discountValue)) / 100;
    }

    // Fixed amount coupon.
    //
    // Example:
    //
    // discountValue = ₦5,000
    //
    // discount = ₦5,000
    else {
      discount = Number(coupon.discountValue);
    }

    // ========================================================
    // 9. APPLY MAX DISCOUNT
    // ========================================================

    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    // Discount can never be
    // greater than subtotal.
    discount = Math.min(discount, subtotal);

    // ========================================================
    // 10. RETURN RESULT
    // ========================================================

    return Response.json({
      success: true,

      data: {
        couponId: coupon.id,

        code: coupon.code,

        discountType: coupon.discountType,

        discount: Number(discount.toFixed(2)),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
