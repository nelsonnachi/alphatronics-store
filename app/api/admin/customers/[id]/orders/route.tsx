import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { orders } from "@/db/schema";

import { requireAdmin } from "@/lib/APIs/auth";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { userOrderQuerySchema } from "@/lib/zod-validations/admin-users";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // ============================================================
    // STEP 1: CHECK ADMIN AUTHORIZATION
    // ============================================================

    await requireAdmin();

    // ============================================================
    // STEP 2: GET CUSTOMER ID
    // ============================================================

    const { id } = await context.params;

    // ============================================================
    // STEP 3: MAKE SURE CUSTOMER EXISTS
    // ============================================================

    const customer = await db.query.users.findFirst({
      where: {
        id,
      },

      columns: {
        id: true,
      },
    });

    if (!customer) {
      throw new ApiError("Customer not found", 404);
    }

    // ============================================================
    // STEP 4: VALIDATE QUERY PARAMETERS
    // ============================================================

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);

    const query = userOrderQuerySchema.parse(searchParams);

    // ============================================================
    // STEP 5: CALCULATE OFFSET
    // ============================================================

    const offset = (query.page - 1) * query.limit;

    // ============================================================
    // STEP 6: BUILD RQB WHERE CONDITION
    // ============================================================

    const whereCondition = {
      userId: id,

      ...(query.status
        ? {
            status: query.status,
          }
        : {}),
    };

    // ============================================================
    // STEP 7: BUILD CORE WHERE CONDITION
    // FOR db.$count()
    // ============================================================

    const whereConditionCore = and(
      eq(orders.userId, id),

      query.status ? eq(orders.status, query.status) : undefined,
    );

    // ============================================================
    // STEP 8: GET ORDERS + TOTAL COUNT
    // ============================================================

    const [customerOrders, total] = await Promise.all([
      db.query.orders.findMany({
        where: whereCondition,

        orderBy: {
          placedAt: "desc",
        },

        limit: query.limit,

        offset,

        columns: {
          id: true,
          orderNumber: true,

          subtotal: true,
          shippingCost: true,
          tax: true,
          discount: true,
          total: true,

          currency: true,

          status: true,

          paymentStatus: true,
          paymentMethod: true,

          paidAt: true,

          trackingNumber: true,
          carrier: true,

          placedAt: true,
          shippedAt: true,
          deliveredAt: true,
          cancelledAt: true,
        },
      }),

      db.$count(orders, whereConditionCore),
    ]);

    // ============================================================
    // STEP 9: RETURN RESPONSE
    // ============================================================

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
