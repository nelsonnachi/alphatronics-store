// app/api/admin/payments/route.ts

import { NextRequest } from "next/server";
import { and, count, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { payments, orders, users } from "@/db/schema";

import { requireAdmin } from "@/lib/APIs/auth";
import { handleApiError } from "@/lib/APIs/api-errors";
import { adminPaymentQuerySchema } from "@/lib/zod-validations/admin-payment";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);

    const query = adminPaymentQuerySchema.parse(searchParams);

    // ==========================================================
    // RELATIONAL FILTER (for db.query.payments.findMany)
    // ==========================================================
    //
    // db.query.payments.findMany only has the `payments` table
    // in scope. Because you're on RQBv2 (defineRelations), we
    // can still filter through relations (order, order.user)
    // using nested objects instead of raw column references —
    // Drizzle turns these into the correct joins internally.
    //
    // This is the actual bug fix: the old code passed a core
    // `and(eq(...), ilike(orders.orderNumber, ...))` condition
    // — built against tables that were never joined in this
    // query — straight into findMany, which fails at the DB
    // level ("missing FROM-clause entry for table orders").
    // ==========================================================

    const relationalConditions: Record<string, unknown>[] = [];

    if (query.status) {
      relationalConditions.push({ status: query.status });
    }

    if (query.method) {
      relationalConditions.push({ method: query.method });
    }

    if (query.provider) {
      relationalConditions.push({ provider: query.provider });
    }

    if (query.search) {
      relationalConditions.push({
        OR: [
          { providerPaymentId: { ilike: `%${query.search}%` } },
          { order: { orderNumber: { ilike: `%${query.search}%` } } },
          { order: { user: { email: { ilike: `%${query.search}%` } } } },
        ],
      });
    }

    const relationalWhere =
      relationalConditions.length > 0
        ? { AND: relationalConditions }
        : undefined;

    const rows = await db.query.payments.findMany({
      where: relationalWhere,

      orderBy: {
        createdAt: "desc",
      },

      limit: query.limit,

      offset: (query.page - 1) * query.limit,

      with: {
        order: {
          with: {
            user: true,
          },
        },
      },
    });

    // ==========================================================
    // CORE FILTER (for the count query, which uses explicit joins)
    // ==========================================================
    //
    // This one is fine to build with eq/ilike/and/or directly on
    // the table objects, because we actually .leftJoin() both
    // orders and users below, so those columns are in scope.
    // ==========================================================

    const coreConditions = [];

    if (query.status) {
      coreConditions.push(eq(payments.status, query.status));
    }

    if (query.method) {
      coreConditions.push(eq(payments.method, query.method));
    }

    if (query.provider) {
      coreConditions.push(eq(payments.provider, query.provider));
    }

    if (query.search) {
      coreConditions.push(
        or(
          ilike(payments.providerPaymentId, `%${query.search}%`),
          ilike(orders.orderNumber, `%${query.search}%`),
          ilike(users.email, `%${query.search}%`)
        )
      );
    }

    const coreWhere =
      coreConditions.length > 0 ? and(...coreConditions) : undefined;

    const [totalResult] = await db
      .select({
        total: count(),
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .where(coreWhere);

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