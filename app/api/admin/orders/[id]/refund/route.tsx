import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/APIs/auth";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { refundPaystackOrder } from "@/lib/payments/refund-paystack-order";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ============================================================
// POST /api/admin/orders/[id]/refund
//
// Creates a Paystack refund for an order.
//
// Body:
//
// {
//   "amount": 5000,
//   "reason": "Customer requested cancellation",
//   "customerNote": "Refund for cancelled order",
//   "merchantNote": "Approved by admin"
// }
//
// amount is optional.
//
// If amount is omitted, the remaining refundable amount
// will be refunded.
// ============================================================

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!id) {
      throw new ApiError("Order ID is required", 400);
    }

    const body = await req.json();

    if (
      body.amount !== undefined &&
      (typeof body.amount !== "number" || !Number.isFinite(body.amount))
    ) {
      throw new ApiError("Refund amount must be a valid number", 400);
    }

    if (body.amount !== undefined && body.amount <= 0) {
      throw new ApiError("Refund amount must be greater than zero", 400);
    }

    const refund = await refundPaystackOrder({
      orderId: id,

      amount: body.amount,

      reason: typeof body.reason === "string" ? body.reason.trim() : undefined,

      customerNote:
        typeof body.customerNote === "string"
          ? body.customerNote.trim()
          : undefined,

      merchantNote:
        typeof body.merchantNote === "string"
          ? body.merchantNote.trim()
          : undefined,
    });

    return Response.json({
      success: true,

      data: refund,

      message:
        refund.status === "processed"
          ? "Refund processed successfully"
          : refund.status === "processing"
            ? "Refund is being processed"
            : "Refund request created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
