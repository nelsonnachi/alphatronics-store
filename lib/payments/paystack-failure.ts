import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db/drizzle";

import {
  payments,
  orders,
  products,
  productVariants,
} from "@/db/schema";

import { ApiError } from "@/lib/APIs/api-errors";

type FailPaystackPaymentInput = {
  reference: string;
  reason?: string;
  rawResponse?: unknown;
  expectedUserId?: string;
};

export async function failPaystackPayment(
  input: FailPaystackPaymentInput,
) {
  return db.transaction(async (tx) => {
    // ==========================================================
    // 1. FIND PAYMENT
    // ==========================================================

    const payment = await tx.query.payments.findFirst({
      where: {
        providerPaymentId: input.reference,
      },
    });

    if (!payment) {
      throw new ApiError("Payment record not found", 404);
    }

    // ==========================================================
    // 2. FIND ORDER
    // ==========================================================

    const order = await tx.query.orders.findFirst({
      where: {
        id: payment.orderId,
      },
      with: {
        items: true,
      },
    });

    if (!order) {
      throw new ApiError(
        "Order associated with payment not found",
        404,
      );
    }

    // ==========================================================
    // 3. OPTIONAL OWNERSHIP CHECK
    // ==========================================================

    if (
      input.expectedUserId &&
      order.userId !== input.expectedUserId
    ) {
      throw new ApiError(
        "You don't have access to this order",
        403,
      );
    }

    // ==========================================================
    // 4. IDEMPOTENCY
    // ==========================================================

    if (payment.status === "failed") {
      return {
        alreadyProcessed: true,
        order,
        payment,
      };
    }

    // ==========================================================
    // 5. NEVER TURN A PAID PAYMENT INTO FAILED
    // ==========================================================

    if (payment.status === "paid") {
      throw new ApiError(
        "A successful payment cannot be marked as failed",
        409,
      );
    }

    // ==========================================================
    // 6. ONLY PENDING PAYMENTS CAN FAIL
    // ==========================================================

    if (payment.status !== "pending") {
      return {
        alreadyProcessed: true,
        order,
        payment,
      };
    }

    // ==========================================================
    // 7. RELEASE RESERVED STOCK
    // ==========================================================

    for (const item of order.items) {
      // --------------------------------------------------------
      // PRODUCT VARIANT
      // --------------------------------------------------------

      if (item.variantId) {
        await tx
          .update(productVariants)
          .set({
            reservedStock: sql`
              GREATEST(
                ${productVariants.reservedStock} - ${item.quantity},
                0
              )
            `,
          })
          .where(
            and(
              eq(
                productVariants.id,
                item.variantId,
              ),
              sql`
                ${productVariants.reservedStock} >= ${item.quantity}
              `,
            ),
          );

        continue;
      }

      // --------------------------------------------------------
      // NORMAL PRODUCT
      // --------------------------------------------------------

      await tx
        .update(products)
        .set({
          reservedStock: sql`
            GREATEST(
              ${products.reservedStock} - ${item.quantity},
              0
            )
          `,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(
              products.id,
              item.productId,
            ),
            sql`
              ${products.reservedStock} >= ${item.quantity}
            `,
          ),
        );
    }

    // ==========================================================
    // 8. MARK PAYMENT FAILED
    // ==========================================================

    const [updatedPayment] = await tx
      .update(payments)
      .set({
        status: "failed",

        rawResponse: {
          reason:
            input.reason ??
            "Paystack transaction failed",

          providerResponse:
            input.rawResponse ?? null,
        },

        failedAt: new Date(),

        updatedAt: new Date(),
      })
      .where(
        and(
          eq(payments.id, payment.id),
          eq(payments.status, "pending"),
        ),
      )
      .returning();

    if (!updatedPayment) {
      const currentPayment =
        await tx.query.payments.findFirst({
          where: {
            id: payment.id,
          },
        });

      if (currentPayment?.status === "failed") {
        return {
          alreadyProcessed: true,
          order,
          payment: currentPayment,
        };
      }

      throw new ApiError(
        "Unable to mark payment as failed",
        500,
      );
    }

    // ==========================================================
    // 9. CANCEL ORDER
    // ==========================================================

    const [updatedOrder] = await tx
      .update(orders)
      .set({
        status: "cancelled",
        paymentStatus: "failed",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id))
      .returning();

    if (!updatedOrder) {
      throw new ApiError(
        "Unable to cancel order",
        500,
      );
    }

    return {
      alreadyProcessed: false,
      order: updatedOrder,
      payment: updatedPayment,
    };
  });
}