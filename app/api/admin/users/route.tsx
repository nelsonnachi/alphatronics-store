// app/api/admin/users/route.ts

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

// ============================================================
// GET ADMIN USERS
// ============================================================

export async function GET(req: NextRequest) {
  try {
    // ----------------------------------------------------------
    // AUTH
    // ----------------------------------------------------------

    await requireAdmin();

    // ----------------------------------------------------------
    // QUERY PARAMETERS
    // ----------------------------------------------------------

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);

    const query = adminUserQuerySchema.parse(searchParams);

    const offset = (query.page - 1) * query.limit;

    // ----------------------------------------------------------
    // WHERE CONDITIONS
    // ----------------------------------------------------------

    const conditions: (SQL | undefined)[] = [
      query.search
        ? or(
            ilike(users.firstName, `%${query.search}%`),

            ilike(users.lastName, `%${query.search}%`),

            ilike(users.email, `%${query.search}%`),

            ilike(users.phone, `%${query.search}%`),
          )
        : undefined,

      query.status === "banned" ? eq(users.isBanned, true) : undefined,

      query.status === "active" ? eq(users.isBanned, false) : undefined,

      query.role ? eq(users.role, query.role) : undefined,
    ];

    const whereCondition = and(
      ...conditions.filter((condition): condition is SQL => Boolean(condition)),
    );

    // ----------------------------------------------------------
    // ORDER BY
    // ----------------------------------------------------------

    let orderBy: SQL[];

    switch (query.sort) {
      case "oldest":
        orderBy = [asc(users.createdAt), asc(users.id)];

        break;

      case "name_asc":
        orderBy = [asc(users.firstName), asc(users.id)];

        break;

      case "name_desc":
        orderBy = [desc(users.firstName), asc(users.id)];

        break;

      case "newest":
      default:
        orderBy = [desc(users.createdAt), asc(users.id)];
    }

    // ----------------------------------------------------------
    // USERS + COUNT
    // ----------------------------------------------------------

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,

          clerkId: users.clerkId,

          email: users.email,

          firstName: users.firstName,

          lastName: users.lastName,

          imageUrl: users.imageUrl,

          phone: users.phone,

          role: users.role,

          isBanned: users.isBanned,

          createdAt: users.createdAt,

          updatedAt: users.updatedAt,
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

    const total = Number(totalResult[0]?.total ?? 0);

    // ----------------------------------------------------------
    // USER IDS
    // ----------------------------------------------------------

    const userIds = rows.map((row) => row.id);

    // ----------------------------------------------------------
    // ORDER STATISTICS
    // ----------------------------------------------------------

    let orderCounts: {
      userId: string;

      totalOrders: number;
    }[] = [];

    let orderSums: {
      userId: string;

      totalSpent: string | null;
    }[] = [];

    if (userIds.length > 0) {
      [orderCounts, orderSums] = await Promise.all([
        // ----------------------------------------------------
        // TOTAL ORDERS
        // ----------------------------------------------------

        db
          .select({
            userId: orders.userId,

            totalOrders: count(),
          })
          .from(orders)
          .where(inArray(orders.userId, userIds))
          .groupBy(orders.userId),

        // ----------------------------------------------------
        // TOTAL SPENT
        // ----------------------------------------------------

        db
          .select({
            userId: orders.userId,

            totalSpent: sum(orders.total),
          })
          .from(orders)
          .where(
            and(
              inArray(orders.userId, userIds),

              eq(orders.paymentStatus, "paid"),
            ),
          )
          .groupBy(orders.userId),
      ]);
    }

    // ----------------------------------------------------------
    // CREATE LOOKUP MAPS
    // ----------------------------------------------------------

    const totalOrdersByUserId = new Map(
      orderCounts.map((row) => [row.userId, Number(row.totalOrders)]),
    );

    const totalSpentByUserId = new Map(
      orderSums.map((row) => [row.userId, Number(row.totalSpent ?? 0)]),
    );

    // ----------------------------------------------------------
    // FINAL DATA
    // ----------------------------------------------------------

    const data = rows.map((row) => ({
      ...row,

      totalOrders: totalOrdersByUserId.get(row.id) ?? 0,

      totalSpent: totalSpentByUserId.get(row.id) ?? 0,
    }));

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return Response.json({
      success: true,

      data,

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
