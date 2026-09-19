import { db } from "@/db/drizzle";

import { failPaystackPayment } from "@/lib/payments/paystack-failure";

export async function expirePendingPaystackPayments() {
  const expiredPayments = await db.query.payments.findMany({
    where: {
      status: "pending",

      expiresAt: {
        isNotNull: true,

        lte: new Date(),
      },
    },
  });

  let processed = 0;

  for (const payment of expiredPayments) {
    if (!payment.providerPaymentId) {
      continue;
    }

    try {
      await failPaystackPayment({
        reference: payment.providerPaymentId,

        reason: "Payment expired before completion.",
      });

      processed++;
    } catch (error) {
      console.error(`Failed to expire payment ${payment.id}`, error);
    }
  }

  return {
    found: expiredPayments.length,

    processed,
  };
}
