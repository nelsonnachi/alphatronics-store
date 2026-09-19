import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { orders } from "@/db/schema";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";
import { requireUser } from "@/lib/APIs/auth";

// GET /api/orders/[id]
// Get one order belonging to the logged-in customer.
export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    // Make sure the customer is logged in.
    const user = await requireUser();

    // Get the order ID from the URL.
    //
    // Example:
    // /api/orders/abc123
    //
    // id = "abc123"
    const { id } = await params;

    // Find the order.
    const order = await db.query.orders.findFirst({
      where: {
        id,
      },

      with: {
        // Products/items inside the order.
        items: true,

        // Payment information.
        payments: true,

        // Shipping/billing address snapshot.
        addressSnapshots: true,

        // Coupon used on the order, if any.
        coupon: {
          columns: {
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
    });

    // Order doesn't exist.
    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // SECURITY CHECK
    //
    // The order belongs to another user.
    //
    // Don't reveal that the order exists.
    if (order.userId !== user.id) {
      throw new ApiError("Order not found", 404);
    }

    return Response.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/orders/[id]
//
// Customer cancellation.
//
// The customer is NOT actually deleting the database row.
// We change its status to "cancelled".
export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    // Make sure the customer is logged in.
    const user = await requireUser();

    const { id } = await params;

    // Find the order.
    const order = await db.query.orders.findFirst({
      where: {
        id,
      },
    });

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // SECURITY CHECK
    //
    // A customer can only cancel their own order.
    if (order.userId !== user.id) {
      throw new ApiError("Order not found", 404);
    }

    // Only pending and processing orders
    // can be cancelled by the customer.
    if (!["pending", "processing"].includes(order.status)) {
      throw new ApiError("This order can no longer be cancelled", 400);
    }

    const now = new Date();

    // We are NOT deleting the order.
    //
    // We are changing its status.
    const [updated] = await db
      .update(orders)
      .set({
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      throw new ApiError("Order cancellation failed", 500);
    }

    return Response.json({
      success: true,

      data: updated,

      message: "Order cancelled successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
