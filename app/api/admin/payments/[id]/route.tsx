// app/api/admin/payments/[id]/route.ts

import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";

import {
  ApiError,
  handleApiError,
} from "@/lib/APIs/api-errors";

import { requireAdmin } from "@/lib/APIs/auth";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    // ==========================================================
    // 1. REQUIRE ADMIN
    // ==========================================================

    await requireAdmin();

    // ==========================================================
    // 2. GET PAYMENT ID
    // ==========================================================

    const { id } = await params;

    // ==========================================================
    // 3. GET PAYMENT
    // ==========================================================

    const payment =
      await db.query.payments.findFirst({
        where: {
          id,
        },

        with: {
          order: {
            with: {
              user: true,

              coupon: true,

              items: {
                with: {
                  product: true,

                  variant: true,
                },
              },

              addressSnapshots: true,
            },
          },
        },
      });

    if (!payment) {
      throw new ApiError(
        "Payment not found",
        404,
      );
    }

    // ==========================================================
    // 4. MAKE SURE ORDER EXISTS
    // ==========================================================

    if (!payment.order) {
      throw new ApiError(
        "Order associated with payment was not found",
        404,
      );
    }

    const order = payment.order;

    // ==========================================================
    // 5. GET REFUNDS
    // ==========================================================

    const paymentRefunds =
      await db.query.refunds.findMany({
        where: {
          paymentId: payment.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ==========================================================
    // 6. CUSTOMER
    // ==========================================================

    const customer = order.user
      ? {
          id: order.user.id,

          email: order.user.email,

          firstName:
            order.user.firstName,

          lastName:
            order.user.lastName,
        }
      : null;

    // ==========================================================
    // 7. ORDER ITEMS
    // ==========================================================

    const items =
      order.items.map((item) => ({
        id: item.id,

        orderId: item.orderId,

        productId: item.productId,

        variantId:
          item.variantId,

        productName:
          item.productName,

        quantity:
          item.quantity,

        unitPrice:
          String(item.unitPrice),

        totalPrice: String(item.subtotal),
      }));

    // ==========================================================
    // 8. PAYMENT DATA
    // ==========================================================

    const paymentData = {
      id: payment.id,

      orderId:
        payment.orderId,

      provider:
        payment.provider,

      reference:
        payment.providerPaymentId,

      amount:
        String(payment.amount),

      currency:
        payment.currency,

      status:
        payment.status,

      refundedAmount:
        String(payment.refundedAmount),

      paidAt:
        payment.paidAt,

      failedAt:
        payment.failedAt,

      refundedAt:
        payment.refundedAt,

      createdAt:
        payment.createdAt,

      orderNumber:
        order.orderNumber,

      customerEmail:
        customer?.email ?? null,
    };

    // ==========================================================
    // 9. ORDER DATA
    // ==========================================================

    const orderData = {
      id:
        order.id,

      orderNumber:
        order.orderNumber,

      userId:
        order.userId,

      subtotal:
        String(order.subtotal),

      tax:
        String(order.tax),

      shippingFee: String(order.shippingCost),

      discount:
        String(order.discount),

      total:
        String(order.total),

      currency:
        order.currency,

      status:
        order.status,

      paymentStatus:
        order.paymentStatus,

      paidAt:
        order.paidAt,

      createdAt:
        order.createdAt,
    };

    // ==========================================================
    // 10. RETURN CLEAN RESPONSE
    // ==========================================================

    return Response.json({
      success: true,

      data: {
        payment:
          paymentData,

        order:
          orderData,

        customer,

        items,

        refunds:
          paymentRefunds,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}