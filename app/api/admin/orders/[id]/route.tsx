import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { orders, products, productVariants, payments } from "@/db/schema";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { requireAdmin } from "@/lib/APIs/auth";

import { updateOrderStatusSchema } from "@/lib/zod-validations/order";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================================
// ORDER STATUS TYPE
// ============================================================
//
// Gets the allowed status type directly from the orders table.
//
// Example:
//
// "pending"
// "processing"
// "shipped"
// "out_for_delivery"
// "delivered"
// "cancelled"
// "refunded"
// "failed"
// ============================================================

type OrderStatus = typeof orders.$inferSelect.status;

// ============================================================
// WHICH ORDER STATUS CAN MOVE TO WHICH NEXT STATUS
// ============================================================
//
// Example:
//
// pending
//    ↓
// processing
//    ↓
// shipped
//    ↓
// out_for_delivery
//    ↓
// delivered
//
// An order can also be cancelled before delivery.
//
// We do NOT allow arbitrary status changes because that could
// cause problems with inventory and payments.
// ============================================================

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled", "failed"],

  processing: ["shipped", "cancelled", "failed"],

  shipped: ["out_for_delivery"],

  out_for_delivery: ["delivered"],

  delivered: [],

  cancelled: [],

  refunded: [],

  failed: [],
};

// ============================================================
// GET /api/admin/orders/[id]
//
// Returns the complete information needed by the admin order
// details page.
//
// Includes:
//
// - customer
// - order items
// - products
// - variants
// - payments
// - shipping address
// - billing address
// - address snapshots
// - coupon
// ============================================================

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    // --------------------------------------------------------
    // STEP 1: MAKE SURE THE USER IS AN ADMIN
    // --------------------------------------------------------

    await requireAdmin();

    // --------------------------------------------------------
    // STEP 2: GET ORDER ID FROM URL
    // --------------------------------------------------------

    const { id } = await params;

    // --------------------------------------------------------
    // STEP 3: GET THE ORDER
    // --------------------------------------------------------

    const order = await db.query.orders.findFirst({
      where: {
        id,
      },

      with: {
        // ----------------------------------------------------
        // CUSTOMER
        // ----------------------------------------------------

        user: {
          columns: {
            id: true,
            clerkId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            imageUrl: true,
            role: true,
            isBanned: true,
            createdAt: true,
          },
        },

        // ----------------------------------------------------
        // ORDER ITEMS
        // ----------------------------------------------------

        items: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                sku: true,
              },
            },

            variant: {
              columns: {
                id: true,
                name: true,
                sku: true,
                attributes: true,
              },
            },
          },
        },

        // ----------------------------------------------------
        // PAYMENTS
        // ----------------------------------------------------

        payments: {
          columns: {
            id: true,
            provider: true,
            providerPaymentId: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
            rawResponse: true,
            paidAt: true,
            failedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },

        // ----------------------------------------------------
        // ADDRESSES
        // ----------------------------------------------------

        shippingAddress: true,

        billingAddress: true,

        addressSnapshots: true,

        // ----------------------------------------------------
        // COUPON
        // ----------------------------------------------------

        coupon: {
          columns: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
    });

    // --------------------------------------------------------
    // STEP 4: MAKE SURE THE ORDER EXISTS
    // --------------------------------------------------------

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // --------------------------------------------------------
    // STEP 5: RETURN ORDER
    // --------------------------------------------------------

    return Response.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// PATCH /api/admin/orders/[id]
//
// Allows an admin to update:
//
// - status
// - trackingNumber
// - carrier
// - adminNote
//
// When the status changes:
//
// shipped
//    → shippedAt is recorded
//
// delivered
//    → deliveredAt is recorded
//
// cancelled
//    → cancelledAt is recorded
//    → inventory is restored/released
//    → pending payment becomes failed
//
// IMPORTANT:
//
// Refunds are NOT processed here.
//
// A paid order must go through the dedicated refund process.
// ============================================================

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    // --------------------------------------------------------
    // STEP 1: MAKE SURE THE USER IS AN ADMIN
    // --------------------------------------------------------

    await requireAdmin();

    // --------------------------------------------------------
    // STEP 2: GET ORDER ID
    // --------------------------------------------------------

    const { id } = await params;

    // --------------------------------------------------------
    // STEP 3: READ REQUEST BODY
    // --------------------------------------------------------

    const body = await req.json();

    // --------------------------------------------------------
    // STEP 4: VALIDATE REQUEST BODY
    // --------------------------------------------------------

    const input = updateOrderStatusSchema.parse(body);

    // --------------------------------------------------------
    // STEP 5: START DATABASE TRANSACTION
    // --------------------------------------------------------
    //
    // Everything related to this update happens inside one
    // transaction.
    //
    // If something fails, the database changes are rolled back.
    //
    // Example:
    //
    // Restore stock
    //      ↓
    // Update payment
    //      ↓
    // Update order
    //
    // If updating the order fails, the previous changes are
    // rolled back.
    // --------------------------------------------------------

    const result = await db.transaction(async (tx) => {
      // ----------------------------------------------------
      // STEP 6: GET CURRENT ORDER
      // ----------------------------------------------------

      const existingOrder = await tx.query.orders.findFirst({
        where: {
          id,
        },

        with: {
          payments: true,

          items: true,
        },
      });

      // ----------------------------------------------------
      // STEP 7: MAKE SURE ORDER EXISTS
      // ----------------------------------------------------

      if (!existingOrder) {
        throw new ApiError("Order not found", 404);
      }

      // ----------------------------------------------------
      // STEP 8: REFUNDS ARE NOT HANDLED HERE
      // ----------------------------------------------------
      //
      // Setting an order to "refunded" should only happen
      // after the actual payment provider has confirmed
      // the refund.
      //
      // Therefore the normal status endpoint rejects it.
      // ----------------------------------------------------

      if (input.status === "refunded") {
        throw new ApiError(
          "Refunded orders must be processed through the refund endpoint",
          400,
        );
      }

      // ----------------------------------------------------
      // STEP 9: CHECK WHETHER STATUS CHANGED
      // ----------------------------------------------------

      const statusChanged = input.status !== existingOrder.status;

      // ----------------------------------------------------
      // STEP 10: CHECK WHETHER ANYTHING CHANGED
      // ----------------------------------------------------

      const somethingToUpdate =
        statusChanged ||
        input.trackingNumber !== undefined ||
        input.carrier !== undefined ||
        input.adminNote !== undefined;

      if (!somethingToUpdate) {
        throw new ApiError("No order changes were provided", 400);
      }

      // ----------------------------------------------------
      // STEP 11: VALIDATE STATUS TRANSITION
      // ----------------------------------------------------
      //
      // Example:
      //
      // processing → shipped       ✅
      //
      // processing → delivered     ❌
      //
      // delivered → pending        ❌
      // ----------------------------------------------------

      if (statusChanged) {
        const currentStatus = existingOrder.status;

        const nextStatus = input.status;

        const allowedStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus];

        if (!allowedStatuses.includes(nextStatus)) {
          throw new ApiError(
            `Cannot change order status from "${currentStatus}" to "${nextStatus}"`,
            400,
          );
        }
      }

      // ----------------------------------------------------
      // STEP 12: CURRENT TIME
      // ----------------------------------------------------

      const now = new Date();

      // ----------------------------------------------------
      // STEP 13: BUILD ORDER UPDATE
      // ----------------------------------------------------

      const updateData: Partial<typeof orders.$inferInsert> = {
        updatedAt: now,
      };

      // ----------------------------------------------------
      // UPDATE STATUS
      // ----------------------------------------------------

      if (statusChanged) {
        updateData.status = input.status;
      }

      // ----------------------------------------------------
      // UPDATE TRACKING NUMBER
      // ----------------------------------------------------

      if (input.trackingNumber !== undefined) {
        updateData.trackingNumber = input.trackingNumber?.trim() || null;
      }

      // ----------------------------------------------------
      // UPDATE CARRIER
      // ----------------------------------------------------

      if (input.carrier !== undefined) {
        updateData.carrier = input.carrier?.trim() || null;
      }

      // ----------------------------------------------------
      // UPDATE ADMIN NOTE
      // ----------------------------------------------------

      if (input.adminNote !== undefined) {
        updateData.adminNote = input.adminNote?.trim() || null;
      }

      // ====================================================
      // STEP 14: STATUS TIMESTAMPS
      // ====================================================
      //
      // We only set the timestamp the first time the order
      // reaches that status.
      // ====================================================

      // ----------------------------------------------------
      // SHIPPED
      // ----------------------------------------------------

      if (
        statusChanged &&
        input.status === "shipped" &&
        existingOrder.shippedAt === null
      ) {
        updateData.shippedAt = now;
      }

      // ----------------------------------------------------
      // DELIVERED
      // ----------------------------------------------------

      if (
        statusChanged &&
        input.status === "delivered" &&
        existingOrder.deliveredAt === null
      ) {
        updateData.deliveredAt = now;
      }

      // ----------------------------------------------------
      // CANCELLED
      // ----------------------------------------------------

      if (
        statusChanged &&
        input.status === "cancelled" &&
        existingOrder.cancelledAt === null
      ) {
        updateData.cancelledAt = now;
      }

      // ====================================================
      // STEP 15: HANDLE ORDER CANCELLATION
      // ====================================================
      //
      // This section only runs when the order is actually
      // moving INTO "cancelled".
      //
      // It does not run when an already-cancelled order is
      // updated.
      // ====================================================

      if (statusChanged && input.status === "cancelled") {
        // --------------------------------------------------
        // STEP 15A: FIND THE ACTIVE PAYMENT
        // --------------------------------------------------
        //
        // An order can potentially have multiple payment
        // attempts.
        //
        // Example:
        //
        // Payment 1 → failed
        // Payment 2 → failed
        // Payment 3 → pending
        //
        // We want the newest relevant payment.
        // --------------------------------------------------

        const paymentsList = existingOrder.payments;

        const sortedPayments = [...paymentsList].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );

        const activePayment =
          sortedPayments.find(
            (payment) =>
              payment.status !== "failed" && payment.status !== "refunded",
          ) ?? sortedPayments[0];

        // --------------------------------------------------
        // STEP 15B: MAKE SURE PAYMENT EXISTS
        // --------------------------------------------------

        if (!activePayment) {
          throw new ApiError("Order payment record not found", 409);
        }

        // --------------------------------------------------
        // STEP 15C: DO NOT CANCEL A PAID ORDER DIRECTLY
        // --------------------------------------------------
        //
        // If the customer already paid:
        //
        // paid
        //   ↓
        // refund process
        //   ↓
        // payment provider
        //
        // We should not silently cancel it and pretend
        // the customer's money was handled.
        // --------------------------------------------------

        if (
          activePayment.status === "paid" ||
          activePayment.status === "partially_refunded"
        ) {
          throw new ApiError(
            "This order has already been paid. Process a refund before cancelling the order.",
            409,
          );
        }

        // --------------------------------------------------
        // STEP 15D: CHECK PAYMENT METHOD
        // --------------------------------------------------
        //
        // CASH ON DELIVERY:
        //
        // Stock was already deducted at checkout.
        //
        // Therefore cancellation must ADD stock back.
        //
        //
        // ONLINE PAYMENT:
        //
        // Stock was reserved at checkout.
        //
        // Therefore cancellation must REMOVE the reservation.
        // --------------------------------------------------

        const isCashOnDelivery = activePayment.method === "cash_on_delivery";

        // ==================================================
        // STEP 15E: PROCESS EVERY ORDER ITEM
        // ==================================================

        for (const item of existingOrder.items) {
          // =================================================
          // PRODUCT VARIANT
          // =================================================
          //
          // Example:
          //
          // iPhone
          //   └── 256GB / Black
          //
          // The inventory belongs to the variant.
          // =================================================

          if (item.variantId) {
            // ------------------------------------------------
            // COD VARIANT
            // ------------------------------------------------
            //
            // Stock was already deducted.
            //
            // Put it back.
            // ------------------------------------------------

            if (isCashOnDelivery) {
              await tx
                .update(productVariants)
                .set({
                  stock: sql`
                      ${productVariants.stock}
                      + ${item.quantity}
                    `,
                })
                .where(eq(productVariants.id, item.variantId));
            }

            // ------------------------------------------------
            // ONLINE PAYMENT VARIANT
            // ------------------------------------------------
            //
            // Stock wasn't permanently deducted.
            //
            // Only release the reservation.
            // ------------------------------------------------
            else {
              await tx
                .update(productVariants)
                .set({
                  reservedStock: sql`
                      GREATEST(
                        ${productVariants.reservedStock}
                        - ${item.quantity},
                        0
                      )
                    `,
                })
                .where(eq(productVariants.id, item.variantId));
            }

            // ------------------------------------------------
            // The variant has already been handled.
            //
            // Don't continue into normal product handling.
            // ------------------------------------------------

            continue;
          }

          // =================================================
          // NORMAL PRODUCT
          // =================================================
          //
          // This item does not have a variant.
          // =================================================

          if (isCashOnDelivery) {
            // ------------------------------------------------
            // COD NORMAL PRODUCT
            // ------------------------------------------------
            //
            // Stock was deducted during checkout.
            //
            // Restore it.
            // ------------------------------------------------

            const [updatedProduct] = await tx
              .update(products)
              .set({
                stock: sql`
                    ${products.stock}
                    + ${item.quantity}
                  `,
                updatedAt: now,
              })
              .where(eq(products.id, item.productId))
              .returning({
                stock: products.stock,

                lowStockThreshold: products.lowStockThreshold,
              });

            // ------------------------------------------------
            // Make sure the product actually existed.
            // ------------------------------------------------

            if (!updatedProduct) {
              throw new ApiError("Unable to restore product stock", 409);
            }

            // ------------------------------------------------
            // RECALCULATE STOCK STATUS
            // ------------------------------------------------
            //
            // Example:
            //
            // stock = 0
            //       → out_of_stock
            //
            // stock <= threshold
            //       → low_stock
            //
            // stock > threshold
            //       → in_stock
            // ------------------------------------------------

            const stockStatus =
              updatedProduct.stock === 0
                ? "out_of_stock"
                : updatedProduct.stock <= updatedProduct.lowStockThreshold
                  ? "low_stock"
                  : "in_stock";

            // ------------------------------------------------
            // SAVE NEW STOCK STATUS
            // ------------------------------------------------

            await tx
              .update(products)
              .set({
                stockStatus,
                updatedAt: now,
              })
              .where(eq(products.id, item.productId));
          }

          // --------------------------------------------------
          // ONLINE PAYMENT NORMAL PRODUCT
          // --------------------------------------------------
          //
          // Release reserved stock instead of restoring
          // actual stock.
          // --------------------------------------------------
          else {
            await tx
              .update(products)
              .set({
                reservedStock: sql`
                    GREATEST(
                      ${products.reservedStock}
                      - ${item.quantity},
                      0
                    )
                  `,
                updatedAt: now,
              })
              .where(eq(products.id, item.productId));
          }
        }

        // ==================================================
        // STEP 15F: HANDLE PENDING PAYMENT
        // ==================================================
        //
        // If the payment is still pending and the order is
        // cancelled, the payment attempt is no longer valid.
        //
        // Therefore:
        //
        // pending → failed
        //
        // We also check that the payment is STILL pending
        // when performing the update.
        // ==================================================

        if (activePayment.status === "pending") {
          const [updatedPayment] = await tx
            .update(payments)
            .set({
              status: "failed",
              failedAt: now,
              updatedAt: now,
            })
            .where(
              and(
                eq(payments.id, activePayment.id),
                eq(payments.status, "pending"),
              ),
            )
            .returning({
              id: payments.id,
            });

          // ------------------------------------------------
          // Make sure payment was actually updated.
          // ------------------------------------------------

          if (!updatedPayment) {
            throw new ApiError(
              "Unable to update payment during cancellation",
              500,
            );
          }
        }
      }

      // ====================================================
      // STEP 16: UPDATE THE ORDER
      // ====================================================

      const [updatedOrder] = await tx
        .update(orders)
        .set(updateData)
        .where(eq(orders.id, id))
        .returning();

      // ----------------------------------------------------
      // Make sure order was actually updated.
      // ----------------------------------------------------

      if (!updatedOrder) {
        throw new ApiError("Order update failed", 500);
      }

      // ----------------------------------------------------
      // Return information from the transaction.
      // ----------------------------------------------------

      return {
        order: updatedOrder,

        wasCancelled: statusChanged && input.status === "cancelled",
      };
    });

    // ========================================================
    // STEP 17: RETURN SUCCESS RESPONSE
    // ========================================================

    return Response.json({
      success: true,

      data: result.order,

      message: result.wasCancelled
        ? "Order cancelled and inventory updated successfully"
        : "Order updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
