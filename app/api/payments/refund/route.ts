import { NextRequest } from "next/server";

import {
  refundPaystackOrder,
} from "@/lib/payments/refund-paystack-order";

import {
  ApiError,
  handleApiError,
} from "@/lib/APIs/api-errors";

import { requireAdmin } from "@/lib/APIs/auth";

export async function POST(
  req: NextRequest
) {
  try {
    await requireAdmin();

    const body = await req.json();

    if (
      !body.orderId ||
      typeof body.orderId !== "string"
    ) {
      throw new ApiError(
        "Order ID is required",
        400
      );
    }

    const result =
      await refundPaystackOrder({
        orderId: body.orderId,
        amount:
          body.amount !== undefined
            ? Number(body.amount)
            : undefined,
        reason: body.reason,
        customerNote:
          body.customerNote,
        merchantNote:
          body.merchantNote,
      });

    return Response.json({
      success: true,
      data: result,
      message:
        "Refund processed successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}