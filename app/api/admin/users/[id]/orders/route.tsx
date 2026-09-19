// app/api/admin/users/[id]/orders/route.ts

import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";

import { orders } from "@/db/schema";

import { requireAdmin } from "@/lib/APIs/auth";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { userOrderQuerySchema } from "@/lib/zod-validations/admin-users";

import { z } from "zod";

export const runtime = "nodejs";

// ============================================================
// ROUTE CONTEXT
// ============================================================

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const idParamSchema = z.string().uuid("Invalid user id");

// ============================================================
// GET USER ORDERS
// ============================================================

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // ----------------------------------------------------------
    // AUTH
    // ----------------------------------------------------------

    await requireAdmin();

    // ----------------------------------------------------------
    // USER ID
    // ----------------------------------------------------------

    const { id } = await context.params;

    idParamSchema.parse(id);

    // ----------------------------------------------------------
    // CHECK USER EXISTS (RQBv2 object syntax)
    // ----------------------------------------------------------

    const customer = await db.query.users.findFirst({
      where: { id },
      columns: { id: true },
    });

    if (!customer) {
      throw new ApiError("User not found", 404);
    }

    // ----------------------------------------------------------
    // QUERY
    // ----------------------------------------------------------

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);

    const query = userOrderQuerySchema.parse(searchParams);

    const offset = (query.page - 1) * query.limit;

    // ----------------------------------------------------------
    // WHERE
    // ----------------------------------------------------------

    const whereCondition = and(
      eq(orders.userId, id),
      query.status ? eq(orders.status, query.status) : undefined,
    );

    // ----------------------------------------------------------
    // ORDERS + COUNT
    // ----------------------------------------------------------

    const [customerOrders, total] = await Promise.all([
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          subtotal: orders.subtotal,
          shippingCost: orders.shippingCost,
          tax: orders.tax,
          discount: orders.discount,
          total: orders.total,
          currency: orders.currency,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          paymentMethod: orders.paymentMethod,
          paidAt: orders.paidAt,
          trackingNumber: orders.trackingNumber,
          carrier: orders.carrier,
          placedAt: orders.placedAt,
          shippedAt: orders.shippedAt,
          deliveredAt: orders.deliveredAt,
          cancelledAt: orders.cancelledAt,
        })
        .from(orders)
        .where(whereCondition)
        .orderBy(orders.placedAt)
        .limit(query.limit)
        .offset(offset),

      db.$count(orders, whereCondition),
    ]);

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return Response.json({
      success: true,
      data: customerOrders,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
