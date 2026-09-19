import { and, eq, sum } from "drizzle-orm";

import { db } from "@/db/drizzle";

import {
  payments,
  refunds,
  orders,
} from "@/db/schema";

import { ApiError } from "@/lib/APIs/api-errors";

import { createPaystackRefund } from "@/lib/payments/paystack-refund";

type CreateRefundInput = {
  orderId: string;
  amount?: number;
  reason?: string;
  customerNote?: string;
  merchantNote?: string;
};

export async function refundPaystackOrder(
  input: CreateRefundInput,
) {
  // ==========================================================
  // 1. FIND ORDER
  // ==========================================================

  const order = await db.query.orders.findFirst({
    where: {
      id: input.orderId,
    },
  });

  if (!order) {
    throw new ApiError(
      "Order not found",
      404,
    );
  }

  // ==========================================================
  // 2. CREATE REFUND RESERVATION
  //
  // We do the important refund checks inside a transaction.
  //
  // The payment row is locked before calculating the
  // refundable amount.
  //
  // This prevents two admins from simultaneously creating
  // refunds against the same payment.
  // ==========================================================

  const refundReservation =
    await db.transaction(async (tx) => {
      // ========================================================
      // FIND REFUNDABLE PAYMENT
      // ========================================================

      const payment =
        await tx.query.payments.findFirst({
          where: {
            orderId: input.orderId,

            status: {
              in: [
                "paid",
                "partially_refunded",
              ],
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      if (!payment) {
        throw new ApiError(
          "No refundable payment was found for this order",
          409,
        );
      }

      // ========================================================
      // ONLY PAYSTACK PAYMENTS
      // ========================================================

      if (
        payment.provider !==
        "paystack"
      ) {
        throw new ApiError(
          "This payment cannot be refunded through Paystack",
          400,
        );
      }

      // ========================================================
      // PAYSTACK REFERENCE
      //
      // providerPaymentId is nullable in the database schema,
      // so we explicitly verify it exists.
      // ========================================================

      if (!payment.providerPaymentId) {
        throw new ApiError(
          "Paystack payment reference is missing",
          409,
        );
      }

      // ========================================================
      // LOCK PAYMENT ROW
      //
      // FOR UPDATE prevents another transaction from changing
      // this payment while we are calculating the refund.
      // ========================================================

      const lockedPayments =
        await tx
          .select()
          .from(payments)
          .where(
            eq(
              payments.id,
              payment.id,
            ),
          )
          .for("update");

      const lockedPayment =
        lockedPayments[0];

      if (!lockedPayment) {
        throw new ApiError(
          "Payment record not found",
          409,
        );
      }

      // ========================================================
      // VERIFY PAYSTACK REFERENCE AGAIN
      //
      // TypeScript sees providerPaymentId as string | null
      // because the database column is nullable.
      //
      // This check guarantees that the value we return below
      // is a string.
      // ========================================================

      if (
        !lockedPayment.providerPaymentId
      ) {
        throw new ApiError(
          "Paystack payment reference is missing",
          409,
        );
      }

      // ========================================================
      // CHECK FOR EXISTING ACTIVE REFUND
      //
      // This is now inside the transaction.
      // ========================================================

      const existingRefund =
        await tx.query.refunds.findFirst({
          where: {
            paymentId:
              lockedPayment.id,

            status: {
              in: [
                "pending",
                "processing",
              ],
            },
          },
        });

      if (existingRefund) {
        throw new ApiError(
          "A refund for this payment is already being processed",
          409,
        );
      }

      // ========================================================
      // CALCULATE ALREADY REFUNDED
      //
      // Only processed refunds count toward the amount already
      // refunded.
      // ========================================================

      const [
        refundedResult,
      ] = await tx
        .select({
          total: sum(
            refunds.amount,
          ),
        })
        .from(refunds)
        .where(
          and(
            eq(
              refunds.paymentId,
              lockedPayment.id,
            ),
            eq(
              refunds.status,
              "processed",
            ),
          ),
        );

      const alreadyRefunded =
        Number(
          refundedResult?.total ??
            0,
        );

      // ========================================================
      // ORIGINAL PAYMENT AMOUNT
      // ========================================================

      const paymentAmount =
        Number(
          lockedPayment.amount,
        );

      // ========================================================
      // REMAINING REFUNDABLE AMOUNT
      // ========================================================

      const remaining =
        Number(
          (
            paymentAmount -
            alreadyRefunded
          ).toFixed(2),
        );

      if (remaining <= 0) {
        throw new ApiError(
          "This payment has already been fully refunded",
          409,
        );
      }

      // ========================================================
      // DETERMINE REFUND AMOUNT
      //
      // If admin supplies an amount, use that amount.
      //
      // If admin does not supply an amount, refund the entire
      // remaining refundable amount.
      // ========================================================

      const refundAmount =
        input.amount ??
        remaining;

      if (
        !Number.isFinite(
          refundAmount,
        ) ||
        refundAmount <= 0
      ) {
        throw new ApiError(
          "Refund amount must be greater than zero",
          400,
        );
      }

      if (
        refundAmount >
        remaining
      ) {
        throw new ApiError(
          `Maximum refundable amount is ${remaining}`,
          400,
        );
      }

      // ========================================================
      // CREATE PENDING REFUND
      //
      // This is our refund reservation.
      //
      // Once this exists, another admin cannot create another
      // refund for the same payment while this one is pending.
      // ========================================================

      const [
        refund,
      ] = await tx
        .insert(refunds)
        .values({
          paymentId:
            lockedPayment.id,

          orderId:
            input.orderId,

          amount:
            refundAmount.toFixed(2),

          currency:
            lockedPayment.currency,

          providerRefundId:
            null,

          status:
            "pending",

          reason:
            input.reason ??
            null,

          customerNote:
            input.customerNote ??
            null,

          merchantNote:
            input.merchantNote ??
            null,

          rawResponse:
            null,

          processedAt:
            null,

          failedAt:
            null,

          updatedAt:
            new Date(),
        })
        .returning();

      if (!refund) {
        throw new ApiError(
          "Unable to create refund record",
          500,
        );
      }

      // ========================================================
      // RETURN EVERYTHING NEEDED TO CALL PAYSTACK
      // ========================================================

      return {
        refundId:
          refund.id,

        paymentId:
          lockedPayment.id,

        providerPaymentId:
          lockedPayment.providerPaymentId,

        paymentAmount,

        refundAmount,

        currency:
          lockedPayment.currency,
      };
    });

  // ==========================================================
  // 3. CALL PAYSTACK
  //
  // We do NOT keep the database transaction open while
  // communicating with Paystack.
  //
  // The pending refund record already acts as our reservation.
  // ==========================================================

  let paystackRefund;

  try {
    paystackRefund =
      await createPaystackRefund({
        transaction:
          refundReservation.providerPaymentId,

        amount:
          refundReservation.refundAmount,

        currency:
          refundReservation.currency,

        customerNote:
          input.customerNote,

        merchantNote:
          input.merchantNote,
      });
  } catch (error) {
    // ========================================================
    // PAYSTACK REQUEST FAILED
    //
    // Mark the refund as failed so the admin can try again.
    // ========================================================

    await db
      .update(refunds)
      .set({
        status:
          "failed",

        failedAt:
          new Date(),

        updatedAt:
          new Date(),

        rawResponse: {
          error:
            error instanceof Error
              ? error.message
              : "Unable to create Paystack refund",
        },
      })
      .where(
        and(
          eq(
            refunds.id,
            refundReservation.refundId,
          ),
          eq(
            refunds.status,
            "pending",
          ),
        ),
      );

    throw error;
  }

  // ==========================================================
  // 4. PAYSTACK REFUND ID
  // ==========================================================

  const providerRefundId =
    String(
      paystackRefund.id,
    );

  // ==========================================================
  // 5. MAP PAYSTACK STATUS
  // ==========================================================

  const refundStatus =
    paystackRefund.status ===
    "processed"
      ? "processed"
      : paystackRefund.status ===
          "failed"
        ? "failed"
        : paystackRefund.status ===
            "processing"
          ? "processing"
          : "pending";

  // ==========================================================
  // 6. FINALIZE REFUND RECORD
  // ==========================================================

  return db.transaction(
    async (tx) => {
      // ========================================================
      // FIND OUR REFUND RESERVATION
      // ========================================================

      const refund =
        await tx.query.refunds.findFirst({
          where: {
            id:
              refundReservation.refundId,
          },
        });

      if (!refund) {
        throw new ApiError(
          "Refund record not found",
          409,
        );
      }

      // ========================================================
      // IDEMPOTENCY CHECK
      //
      // If this Paystack refund ID already exists, do not
      // create another refund record.
      // ========================================================

      const existingProviderRefund =
        await tx.query.refunds.findFirst({
          where: {
            providerRefundId,
          },
        });

      if (
        existingProviderRefund &&
        existingProviderRefund.id !==
          refund.id
      ) {
        return existingProviderRefund;
      }

      // ========================================================
      // UPDATE REFUND RECORD
      // ========================================================

      const [
        updatedRefund,
      ] = await tx
        .update(refunds)
        .set({
          providerRefundId,

          status:
            refundStatus,

          rawResponse:
            paystackRefund,

          processedAt:
            refundStatus ===
            "processed"
              ? new Date()
              : null,

          failedAt:
            refundStatus ===
            "failed"
              ? new Date()
              : null,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            refunds.id,
            refund.id,
          ),
        )
        .returning();

      if (!updatedRefund) {
        throw new ApiError(
          "Unable to update refund record",
          500,
        );
      }

      // ========================================================
      // REFUND FAILED
      //
      // The payment remains unchanged.
      // ========================================================

      if (
        refundStatus ===
        "failed"
      ) {
        return updatedRefund;
      }

      // ========================================================
      // REFUND STILL PROCESSING OR PENDING
      //
      // Do not increase refundedAmount yet.
      //
      // Only a processed refund counts as money actually
      // refunded.
      // ========================================================

      if (
        refundStatus !==
        "processed"
      ) {
        return updatedRefund;
      }

      // ========================================================
      // CALCULATE TOTAL PROCESSED REFUNDS
      // ========================================================

      const [
        processedRefundsResult,
      ] = await tx
        .select({
          total: sum(
            refunds.amount,
          ),
        })
        .from(refunds)
        .where(
          and(
            eq(
              refunds.paymentId,
              refundReservation.paymentId,
            ),
            eq(
              refunds.status,
              "processed",
            ),
          ),
        );

      const totalProcessedRefunds =
        Number(
          processedRefundsResult?.total ??
            0,
        );

      // ========================================================
      // DETERMINE WHETHER PAYMENT IS FULLY REFUNDED
      // ========================================================

      const paymentAmount =
        refundReservation.paymentAmount;

      const newRefundedAmount =
        Number(
          totalProcessedRefunds.toFixed(
            2,
          ),
        );

      const fullyRefunded =
        newRefundedAmount >=
        paymentAmount;

      // ========================================================
      // UPDATE PAYMENT
      // ========================================================

      const [
        updatedPayment,
      ] = await tx
        .update(payments)
        .set({
          refundedAmount:
            newRefundedAmount.toFixed(
              2,
            ),

          status:
            fullyRefunded
              ? "refunded"
              : "partially_refunded",

          refundedAt:
            fullyRefunded
              ? new Date()
              : null,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            payments.id,
            refundReservation.paymentId,
          ),
        )
        .returning();

      if (!updatedPayment) {
        throw new ApiError(
          "Unable to update payment refund status",
          500,
        );
      }

      // ========================================================
      // FULL REFUND
      //
      // Only mark the order as refunded when the entire payment
      // has been refunded.
      // ========================================================

      if (fullyRefunded) {
        const [
          updatedOrder,
        ] = await tx
          .update(orders)
          .set({
            status:
              "refunded",

            paymentStatus:
              "refunded",

            updatedAt:
              new Date(),
          })
          .where(
            eq(
              orders.id,
              input.orderId,
            ),
          )
          .returning();

        if (!updatedOrder) {
          throw new ApiError(
            "Unable to update order refund status",
            500,
          );
        }
      }

      return updatedRefund;
    },
  );
}