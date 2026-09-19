import { NextRequest } from "next/server";
import { and, count, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { orders } from "@/db/schema";

import { orderQuerySchema } from "@/lib/zod-validations/order";
import { handleApiError } from "@/lib/APIs/api-errors";
import { requireUser } from "@/lib/APIs/auth";

// GET /api/orders
// Get the logged-in customer's orders.
export async function GET(req: NextRequest) {
  try {
    // Make sure the user is logged in.
    const user = await requireUser();

    // Read query parameters.
    //
    // Example:
    // /api/orders?page=1&limit=10&status=delivered
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);

    // Validate the query parameters.
    const query = orderQuerySchema.parse(searchParams);

    // Build the WHERE condition used for counting.
    const whereClause = query.status
      ? and(eq(orders.userId, user.id), eq(orders.status, query.status))
      : eq(orders.userId, user.id);

    // Get the customer's orders.
    const rows = await db.query.orders.findMany({
      where: query.status
        ? {
            userId: user.id,
            status: query.status,
          }
        : {
            userId: user.id,
          },

      // Newest orders first.
      orderBy: {
        createdAt: "desc",
      },

      // Pagination.
      limit: query.limit,
      offset: (query.page - 1) * query.limit,

      // We don't need every order item on the order-history page.
      // Just return the first 3.
      with: {
        items: {
          limit: 3,
        },
      },
    });

    // Count how many orders belong to this customer.
    const [totalResult] = await db
      .select({
        total: count(),
      })
      .from(orders)
      .where(whereClause);

    const total = Number(totalResult?.total ?? 0);

    const totalPages = Math.ceil(total / query.limit);

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
