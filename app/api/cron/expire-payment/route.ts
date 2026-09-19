import { expirePendingPaystackPayments } from "@/lib/payments/expire-paystack-payment";


export async function POST(req: Request) {
  try {
    // ==========================================================
    // 1. VERIFY CRON SECRET
    // ==========================================================

    const cronSecret = process.env.CRON_SECRET;

    const authorization = req.headers.get("authorization");

    if (
      !cronSecret ||
      authorization !== `Bearer ${cronSecret}`
    ) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    // ==========================================================
    // 2. EXPIRE PENDING PAYMENTS
    // ==========================================================

    const result =
      await expirePendingPaystackPayments();

    // ==========================================================
    // 3. RESPONSE
    // ==========================================================

    return Response.json({
      success: true,

      data: {
        found: result.found,
        processed: result.processed,
      },

      message:
        "Expired Paystack payments processed successfully",
    });
  } catch (error) {
    console.error(
      "Payment expiration cron error:",
      error,
    );

    return Response.json(
      {
        success: false,

        message:
          "Unable to process expired payments",
      },
      {
        status: 500,
      },
    );
  }
}