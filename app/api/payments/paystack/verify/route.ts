import { NextRequest } from "next/server";

import {
  verifyPaystackTransaction,
} from "@/lib/payments/paystack";

import {
  finalizePaystackPayment,
} from "@/lib/payments/finalize-paystack-payment";

import {
  failPaystackPayment,
} from "@/lib/payments/paystack-failure";

import {
  ApiError,
  handleApiError,
} from "@/lib/APIs/api-errors";

import { requireUser } from "@/lib/APIs/auth";

export async function POST(
  req: NextRequest
) {
  try {
    const user = await requireUser();

    const body = await req.json();

    const reference = body.reference;

    if (
      !reference ||
      typeof reference !== "string"
    ) {
      throw new ApiError(
        "Payment reference is required",
        400
      );
    }

    const transaction =
      await verifyPaystackTransaction(
        reference
      );

    if (
      transaction.status === "success"
    ) {
      const result =
        await finalizePaystackPayment({
          reference:
            transaction.reference,
          amount:
            transaction.amount,
          currency:
            transaction.currency,
          rawResponse:
            transaction,
          expectedUserId:
            user.id,
        });

      return Response.json({
        success: true,
        data: {
          orderId:
            result.order.id,
          orderNumber:
            result.order.orderNumber,
          paymentStatus:
            result.payment.status,
          orderStatus:
            result.order.status,
        },
        message:
          result.alreadyProcessed
            ? "Payment was already processed"
            : "Payment verified successfully",
      });
    }

    if (
      transaction.status === "failed" ||
      transaction.status === "abandoned" ||
      transaction.status === "reversed"
    ) {
      const result =
        await failPaystackPayment({
          reference:
            transaction.reference,
          reason:
            `Paystack transaction ${transaction.status}`,
          rawResponse:
            transaction,
          expectedUserId:
            user.id,
        });

      return Response.json(
        {
          success: false,
          data: {
            orderId:
              result.order.id,
            orderNumber:
              result.order.orderNumber,
            paymentStatus:
              result.payment.status,
            orderStatus:
              result.order.status,
          },
          message:
            "Payment failed. Reserved stock has been released.",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json({
      success: true,
      data: {
        paymentStatus: "pending",
        orderStatus: "pending",
      },
      message:
        "Payment is still being processed. Please wait for confirmation.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}