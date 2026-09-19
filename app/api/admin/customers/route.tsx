import { NextRequest } from "next/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sum,
  SQL,
} from "drizzle-orm";

import { db } from "@/db/drizzle";
import { users, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/APIs/auth";
import { handleApiError } from "@/lib/APIs/api-errors";
import { adminUserQuerySchema } from "@/lib/zod-validations/admin-users";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // ============================================================
    // 1. CHECK ADMIN AUTHENTICATION
    // ============================================================

    const admin = await requireAdmin();

    console.log("=================================");
    console.log("ADMIN USERS API");
    console.log("Admin ID:", admin.id);
    console.log("Admin email:", admin.email);
    console.log("Admin role:", admin.role);
    console.log("=================================");

    // ============================================================
    // 2. GET QUERY PARAMETERS
    // ============================================================

    const searchParams = Object.fromEntries(
      req.nextUrl.searchParams,
    );

    const query = adminUserQuerySchema.parse(
      searchParams,
    );

    const offset =
      (query.page - 1) * query.limit;

    console.log("Customer query:", query);

    // ============================================================
    // 3. BUILD WHERE CONDITIONS
    // ============================================================

    const conditions: (SQL | undefined)[] = [
      // SEARCH
      query.search
        ? or(
            ilike(
              users.firstName,
              `%${query.search}%`,
            ),
            ilike(
              users.lastName,
              `%${query.search}%`,
            ),
            ilike(
              users.email,
              `%${query.search}%`,
            ),
            ilike(
              users.phone,
              `%${query.search}%`,
            ),
          )
        : undefined,

      // STATUS
      query.status === "banned"
        ? eq(users.isBanned, true)
        : undefined,

      query.status === "active"
        ? eq(users.isBanned, false)
        : undefined,

      // ROLE
      query.role
        ? eq(users.role, query.role)
        : undefined,
    ];

    const whereCondition = and(
      ...conditions.filter(
        (
          condition,
        ): condition is SQL => Boolean(condition),
      ),
    );

    // ============================================================
    // 4. BUILD ORDER BY
    // ============================================================

    let orderBy: SQL[];

    switch (query.sort) {
      case "oldest":
        orderBy = [
          asc(users.createdAt),
          asc(users.id),
        ];
        break;

      case "name_asc":
        orderBy = [
          asc(users.firstName),
          asc(users.id),
        ];
        break;

      case "name_desc":
        orderBy = [
          desc(users.firstName),
          asc(users.id),
        ];
        break;

      case "newest":
      default:
        orderBy = [
          desc(users.createdAt),
          asc(users.id),
        ];
        break;
    }

    // ============================================================
    // 5. GET USERS + TOTAL COUNT
    // ============================================================

    const [rows, totalResult] =
      await Promise.all([
        db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            imageUrl: users.imageUrl,
            role: users.role,
            isBanned: users.isBanned,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(whereCondition)
          .orderBy(...orderBy)
          .limit(query.limit)
          .offset(offset),

        db
          .select({
            total: count(),
          })
          .from(users)
          .where(whereCondition),
      ]);

    const total =
      Number(totalResult[0]?.total ?? 0);

    // ============================================================
    // DEBUG
    // ============================================================

    console.log("=================================");
    console.log("ADMIN USERS DATABASE RESULT");
    console.log("Rows:", rows);
    console.log("Rows length:", rows.length);
    console.log("Total users:", total);
    console.log("Query:", query);
    console.log("=================================");

    // ============================================================
    // 6. GET ORDER STATISTICS
    // ============================================================

    const userIds = rows.map(
      (row) => row.id,
    );

    let orderCounts: {
      userId: string;
      totalOrders: number;
    }[] = [];

    let orderSums: {
      userId: string;
      totalSpent: string | null;
    }[] = [];

    if (userIds.length > 0) {
      [
        orderCounts,
        orderSums,
      ] = await Promise.all([
        // --------------------------------------------------------
        // TOTAL ORDERS
        // --------------------------------------------------------

        db
          .select({
            userId: orders.userId,
            totalOrders: count(),
          })
          .from(orders)
          .where(
            inArray(
              orders.userId,
              userIds,
            ),
          )
          .groupBy(orders.userId),

        // --------------------------------------------------------
        // TOTAL SPENT
        // --------------------------------------------------------

        db
          .select({
            userId: orders.userId,
            totalSpent: sum(
              orders.total,
            ),
          })
          .from(orders)
          .where(
            and(
              inArray(
                orders.userId,
                userIds,
              ),
              eq(
                orders.paymentStatus,
                "paid",
              ),
            ),
          )
          .groupBy(orders.userId),
      ]);
    }

    // ============================================================
    // 7. CREATE LOOKUP MAPS
    // ============================================================

    const totalOrdersByUserId =
      new Map(
        orderCounts.map(
          (row) => [
            row.userId,
            Number(row.totalOrders),
          ],
        ),
      );

    const totalSpentByUserId =
      new Map(
        orderSums.map(
          (row) => [
            row.userId,
            Number(
              row.totalSpent ?? 0,
            ),
          ],
        ),
      );

    // ============================================================
    // 8. COMBINE USERS + ORDER STATISTICS
    // ============================================================

    const data = rows.map(
      (row) => ({
        ...row,

        totalOrders:
          totalOrdersByUserId.get(
            row.id,
          ) ?? 0,

        totalSpent:
          totalSpentByUserId.get(
            row.id,
          ) ?? 0,
      }),
    );

    // ============================================================
    // 9. FINAL RESPONSE
    // ============================================================

    console.log("Final customer data:", data);

    return Response.json({
      success: true,

      data,

      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(
          total / query.limit,
        ),
      },
    });
  } catch (error) {
    console.error(
      "ADMIN USERS API ERROR:",
      error,
    );

    return handleApiError(error);
  }
}