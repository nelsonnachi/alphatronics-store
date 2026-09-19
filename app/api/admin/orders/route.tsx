import { NextRequest } from "next/server";
import { count, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { orders } from "@/db/schema";

import { orderQuerySchema } from "@/lib/zod-validations/order";
import { ApiError, handleApiError } from "@/lib/APIs/api-errors";
import { requireAdmin } from "@/lib/APIs/auth";

export const runtime = "nodejs";

// ============================================================
// GET /api/admin/orders
//
// ADMIN:
// Get all customer orders.
//
// Supports:
// - pagination
// - status filtering
// ============================================================

export async function GET(req: NextRequest) {
  try {
    // ==========================================================
    // ADMIN AUTHENTICATION
    // ==========================================================

    await requireAdmin();

    // ==========================================================
    // READ QUERY PARAMETERS
    // ==========================================================

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);

    // ==========================================================
    // VALIDATE QUERY
    // ==========================================================

    const query = orderQuerySchema.parse(searchParams);

    // ==========================================================
    // PAGINATION
    // ==========================================================

    const offset = (query.page - 1) * query.limit;

    // ==========================================================
    // WHERE CLAUSE
    // ==========================================================

    const whereClause = query.status
      ? eq(orders.status, query.status)
      : undefined;

    // ==========================================================
    // GET ORDERS + TOTAL COUNT
    // ==========================================================

    const [rows, totalResult] = await Promise.all([
      db.query.orders.findMany({
        where: query.status
          ? {
              status: query.status,
            }
          : undefined,

        // Newest orders first.
        orderBy: {
          createdAt: "desc",
        },

        limit: query.limit,

        offset,

        // ======================================================
        // ADMIN ORDER RELATIONS
        // ======================================================

        with: {
          // ----------------------------------------------------
          // CUSTOMER
          // ----------------------------------------------------

          user: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              imageUrl: true,
            },
          },

          // ----------------------------------------------------
          // ORDER ITEMS
          //
          // Only return the first 3 items in the list.
          // The complete order is available through /[id].
          // ----------------------------------------------------

          items: {
            limit: 3,
          },

          // ----------------------------------------------------
          // PAYMENTS
          // ----------------------------------------------------

          payments: {
            columns: {
              id: true,
              provider: true,
              providerPaymentId: true,
              amount: true,
              currency: true,
              status: true,
              method: true,
              paidAt: true,
              failedAt: true,
              createdAt: true,
            },
          },
        },
      }),

      // ========================================================
      // COUNT
      // ========================================================

      db
        .select({
          total: count(),
        })
        .from(orders)
        .where(whereClause),
    ]);

    // ==========================================================
    // TOTAL
    // ==========================================================

    const total = Number(totalResult[0]?.total ?? 0);

    // ==========================================================
    // TOTAL PAGES
    // ==========================================================

    const totalPages = Math.ceil(total / query.limit);

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return Response.json({
      success: true,

      data: rows,

      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}