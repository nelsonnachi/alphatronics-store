import crypto from "crypto";

import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";

import { payments, refunds, orders } from "@/db/schema";

export async function POST(req: Request) {
  try {
    // ==========================================================
    // 1. PAYSTACK SECRET
    // ==========================================================

    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return new Response("Server configuration error", {
        status: 500,
      });
    }

    // ==========================================================
    // 2. READ RAW BODY
    // ==========================================================

    const body = await req.text();

    // ==========================================================
    // 3. GET PAYSTACK SIGNATURE
    // ==========================================================

    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return new Response("Missing signature", {
        status: 401,
      });
    }

    // ==========================================================
    // 4. GENERATE EXPECTED SIGNATURE
    // ==========================================================

    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    // ==========================================================
    // 5. TIMING-SAFE SIGNATURE COMPARISON
    // ==========================================================

    const receivedBuffer = Buffer.from(signature, "hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return new Response("Invalid signature", {
        status: 401,
      });
    }

    // ==========================================================
    // 6. PARSE EVENT
    // ==========================================================

    const event = JSON.parse(body);

    // ==========================================================
    // 7. SUCCESSFUL PAYMENT
    // ==========================================================

    if (event.event === "charge.success") {
      const transaction = event.data;

      // Import here if this is the actual file structure
      const { finalizePaystackPayment } = await import(
        "@/lib/payments/finalize-paystack-payment"
      );

      await finalizePaystackPayment({
        reference: transaction.reference,

        amount: transaction.amount,

        currency: transaction.currency,

        rawResponse: transaction,
      });

      return new Response("OK", {
        status: 200,
      });
    }

    // ==========================================================
    // 8. REFUND EVENTS
    // ==========================================================

    if (
      event.event === "refund.pending" ||
      event.event === "refund.processing" ||
      event.event === "refund.failed" ||
      event.event === "refund.processed"
    ) {
      await handleRefundWebhook(event);

      return new Response("OK", {
        status: 200,
      });
    }

    // ==========================================================
    // 9. UNKNOWN EVENT
    // ==========================================================

    return new Response("OK", {
      status: 200,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return new Response("Webhook processing failed", {
      status: 500,
    });
  }
}

// ============================================================
// HANDLE REFUND WEBHOOK
// ============================================================

async function handleRefundWebhook(event: any) {
  const data = event.data;

  const transactionReference = data.transaction_reference;

  if (!transactionReference) {
    console.error("Refund webhook has no transaction reference");

    return;
  }

  const payment = await db.query.payments.findFirst({
    where: {
      providerPaymentId: transactionReference,
    },
  });

  if (!payment) {
    console.error("Refund webhook payment not found:", transactionReference);

    return;
  }

  const refundStatus =
    event.event === "refund.pending"
      ? "pending"
      : event.event === "refund.processing"
      ? "processing"
      : event.event === "refund.failed"
      ? "failed"
      : "processed";

  const providerRefundId = data.refund_reference
    ? String(data.refund_reference)
    : null;

  // ----------------------------------------------------------
  // IMPORTANT:
  //
  // Prefer providerRefundId.
  //
  // Do NOT randomly select a refund belonging to the payment
  // when multiple refunds exist.
  // ----------------------------------------------------------

  if (!providerRefundId) {
    console.error("Refund webhook has no refund reference");

    return;
  }

  const refund = await db.query.refunds.findFirst({
    where: {
      providerRefundId,
    },
  });

  if (!refund) {
    console.error("Refund record not found:", providerRefundId);

    return;
  }

  await db.transaction(async (tx) => {
    // ------------------------------------------------------
    // REFRESH REFUND INSIDE TRANSACTION
    // ------------------------------------------------------

    const currentRefund = await tx.query.refunds.findFirst({
      where: {
        id: refund.id,
      },
    });

    if (!currentRefund) {
      return;
    }

    // ------------------------------------------------------
    // IDEMPOTENCY
    //
    // Already processed means we must not add the amount
    // to payment.refundedAmount again.
    // ------------------------------------------------------

    if (currentRefund.status === "processed" && refundStatus === "processed") {
      return;
    }

    // ------------------------------------------------------
    // UPDATE REFUND
    // ------------------------------------------------------

    await tx
      .update(refunds)
      .set({
        status: refundStatus,

        rawResponse: data,

        processedAt:
          refundStatus === "processed"
            ? currentRefund.processedAt ?? new Date()
            : currentRefund.processedAt,

        failedAt:
          refundStatus === "failed"
            ? currentRefund.failedAt ?? new Date()
            : currentRefund.failedAt,

        updatedAt: new Date(),
      })
      .where(eq(refunds.id, currentRefund.id));

    // ------------------------------------------------------
    // ONLY PROCESS PAYMENT WHEN REFUND BECOMES PROCESSED
    // ------------------------------------------------------

    if (refundStatus !== "processed") {
      return;
    }

    const refundAmount = Number(currentRefund.amount);

    const paymentAmount = Number(payment.amount);

    const currentRefundedAmount = Number(payment.refundedAmount ?? "0");

    const newRefundedAmount = Number(
      (currentRefundedAmount + refundAmount).toFixed(2)
    );

    const fullyRefunded = newRefundedAmount >= paymentAmount;

    // ------------------------------------------------------
    // UPDATE PAYMENT
    // ------------------------------------------------------

    await tx
      .update(payments)
      .set({
        refundedAmount: newRefundedAmount.toFixed(2),

        status: fullyRefunded ? "refunded" : "partially_refunded",

        refundedAt: fullyRefunded ? new Date() : payment.refundedAt,

        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    // ------------------------------------------------------
    // FULL REFUND
    // ------------------------------------------------------

    if (fullyRefunded) {
      await tx
        .update(orders)
        .set({
          status: "refunded",

          paymentStatus: "refunded",

          updatedAt: new Date(),
        })
        .where(eq(orders.id, currentRefund.orderId));
    }
  });
}
