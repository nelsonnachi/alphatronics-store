import {
  and,
  eq,
  gte,
  sql,
} from "drizzle-orm";

import { db } from "@/db/drizzle";

import {
  coupons,
  payments,
  productVariants,
  products,
  orders,
  cartItems,
} from "@/db/schema";

import { ApiError } from "@/lib/APIs/api-errors";

type FinalizePaystackPaymentInput = {
  reference: string;
  amount: number;
  currency: string;
  rawResponse?: unknown;
  expectedUserId?: string;
};

export async function finalizePaystackPayment(
  input: FinalizePaystackPaymentInput,
) {
  return db.transaction(async (tx) => {
    const payment =
      await tx.query.payments.findFirst({
        where: {
          providerPaymentId: input.reference,
        },
      });

    if (!payment) {
      throw new ApiError(
        "Payment record not found",
        404,
      );
    }

    const order =
      await tx.query.orders.findFirst({
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

    if (
      input.expectedUserId &&
      order.userId !== input.expectedUserId
    ) {
      throw new ApiError(
        "You don't have access to this order",
        403,
      );
    }

    if (payment.status === "paid") {
      return {
        alreadyProcessed: true,
        order,
        payment,
      };
    }

    if (payment.status !== "pending") {
      throw new ApiError(
        `Payment cannot be finalized because its current status is "${payment.status}"`,
        409,
      );
    }

    const expectedAmount =
      Math.round(Number(payment.amount) * 100);

    if (input.amount !== expectedAmount) {
      throw new ApiError(
        "Payment amount does not match order amount",
        400,
      );
    }

    if (input.currency !== payment.currency) {
      throw new ApiError(
        "Payment currency does not match order currency",
        400,
      );
    }

    const [updatedPayment] =
      await tx
        .update(payments)
        .set({
          status: "paid",
          rawResponse:
            input.rawResponse ?? null,
          paidAt: new Date(),
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

      if (currentPayment?.status === "paid") {
        return {
          alreadyProcessed: true,
          order,
          payment: currentPayment,
        };
      }

      throw new ApiError(
        "Unable to finalize payment",
        500,
      );
    }

    for (const item of order.items) {
      if (item.variantId) {
        const updatedVariant =
          await tx
            .update(productVariants)
            .set({
              stock: sql`
                ${productVariants.stock}
                - ${item.quantity}
              `,
              reservedStock: sql`
                ${productVariants.reservedStock}
                - ${item.quantity}
              `,
            })
            .where(
              and(
                eq(
                  productVariants.id,
                  item.variantId,
                ),
                gte(
                  productVariants.stock,
                  item.quantity,
                ),
                gte(
                  productVariants.reservedStock,
                  item.quantity,
                ),
              ),
            )
            .returning({
              id: productVariants.id,
            });

        if (updatedVariant.length === 0) {
          throw new ApiError(
            `"${item.productName}" does not have enough stock`,
            409,
          );
        }

        await tx
          .update(products)
          .set({
            soldCount: sql`
              ${products.soldCount}
              + ${item.quantity}
            `,
            updatedAt: new Date(),
          })
          .where(
            eq(
              products.id,
              item.productId,
            ),
          );

        continue;
      }

      const updatedProduct =
        await tx
          .update(products)
          .set({
            stock: sql`
              ${products.stock}
              - ${item.quantity}
            `,
            reservedStock: sql`
              ${products.reservedStock}
              - ${item.quantity}
            `,
            soldCount: sql`
              ${products.soldCount}
              + ${item.quantity}
            `,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(
                products.id,
                item.productId,
              ),
              gte(
                products.stock,
                item.quantity,
              ),
              gte(
                products.reservedStock,
                item.quantity,
              ),
            ),
          )
          .returning({
            id: products.id,
            stock: products.stock,
            lowStockThreshold:
              products.lowStockThreshold,
          });

      if (updatedProduct.length === 0) {
        throw new ApiError(
          `"${item.productName}" does not have enough stock`,
          409,
        );
      }

      const product = updatedProduct[0];

      const stockStatus =
        product.stock === 0
          ? "out_of_stock"
          : product.stock <=
              product.lowStockThreshold
            ? "low_stock"
            : "in_stock";

      await tx
        .update(products)
        .set({
          stockStatus,
          updatedAt: new Date(),
        })
        .where(
          eq(
            products.id,
            product.id,
          ),
        );
    }

    if (order.couponId) {
      const coupon =
        await tx.query.coupons.findFirst({
          where: {
            id: order.couponId,
          },
        });

      if (!coupon) {
        throw new ApiError(
          "Coupon no longer exists",
          409,
        );
      }

      const updatedCoupon =
        await tx
          .update(coupons)
          .set({
            usedCount: sql`
              ${coupons.usedCount} + 1
            `,
          })
          .where(
            and(
              eq(coupons.id, coupon.id),
              coupon.usageLimit !== null
                ? sql`
                    ${coupons.usedCount}
                    < ${coupon.usageLimit}
                  `
                : sql`TRUE`,
            ),
          )
          .returning({
            id: coupons.id,
          });

      if (updatedCoupon.length === 0) {
        throw new ApiError(
          "Coupon usage limit has been reached",
          409,
        );
      }
    }

    const [updatedOrder] =
      await tx
        .update(orders)
        .set({
          paymentStatus: "paid",
          status: "processing",
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          eq(orders.id, order.id),
        )
        .returning();

    if (!updatedOrder) {
      throw new ApiError(
        "Unable to update order",
        500,
      );
    }

    if (order.userId) {
      const cart =
        await tx.query.carts.findFirst({
          where: {
            userId: order.userId,
          },
        });

      if (cart) {
        await tx
          .delete(cartItems)
          .where(
            eq(
              cartItems.cartId,
              cart.id,
            ),
          );
      }
    }

    return {
      alreadyProcessed: false,
      order: updatedOrder,
      payment: updatedPayment,
    };
  });
}