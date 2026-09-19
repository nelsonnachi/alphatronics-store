import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { users, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/APIs/auth";
import {
  ApiError,
  handleApiError,
} from "@/lib/APIs/api-errors";
import { adminUpdateUserSchema } from "@/lib/zod-validations/admin-users";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const idParamSchema = z.string().uuid("Invalid customer id");

// ============================================================
// GET CUSTOMER DETAILS
// ============================================================

export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  try {
    await requireAdmin();

    // Next.js route params are async
    const { id } = await params;

    idParamSchema.parse(id);

    const customer = await db.query.users.findFirst({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new ApiError("Customer not found", 404);
    }

    // Fetch dependent data simultaneously
    const [
      addressList,
      recentOrders,
      cart,
      orderStats,
    ] = await Promise.all([
      // --------------------------------------------------------
      // Customer addresses
      // --------------------------------------------------------

      db.query.addresses.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        limit: 20,
      }),

      // --------------------------------------------------------
      // Recent orders
      // --------------------------------------------------------

      db.query.orders.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          placedAt: "desc",
        },
        limit: 10,
        with: {
          payments: true,
          refunds: true,
        },
      }),

      // --------------------------------------------------------
      // Customer cart
      // --------------------------------------------------------

      db.query.carts.findFirst({
        where: {
          userId: id,
        },
        with: {
          items: {
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
              variant: true,
            },
          },
        },
      }),

      // --------------------------------------------------------
      // All orders for statistics
      // --------------------------------------------------------

      db
        .select()
        .from(orders)
        .where(eq(orders.userId, id)),
    ]);

    // ==========================================================
    // CALCULATE ORDER STATISTICS
    // ==========================================================

    const paidOrders = orderStats.filter(
      (order) => order.paymentStatus === "paid",
    );

    const totalOrders = orderStats.length;

    const totalSpent = paidOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    // ==========================================================
    // PAYMENTS
    // ==========================================================

    const allPayments = recentOrders.flatMap(
      (order) =>
        order.payments.map((payment) => ({
          ...payment,
          orderNumber: order.orderNumber,
        })),
    );

    // ==========================================================
    // REFUNDS
    // ==========================================================

    const allRefunds = recentOrders.flatMap(
      (order) =>
        order.refunds.map((refund) => ({
          ...refund,
          orderNumber: order.orderNumber,
        })),
    );

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return Response.json({
      success: true,

      data: {
        customer,

        addresses: addressList,

        orders: {
          recent: recentOrders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: order.total,
            currency: order.currency,
            placedAt: order.placedAt,
          })),

          totalOrders,
          totalSpent,
        },

        payments: allPayments,

        refunds: {
          recent: allRefunds,
        },

        cart,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// PATCH CUSTOMER
// ============================================================

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
) {
  try {
    const admin = await requireAdmin();

    // Next.js route params are async
    const { id } = await params;

    idParamSchema.parse(id);

    // ========================================================
    // READ REQUEST BODY
    // ========================================================

    const body = await req.json();

    const updates = adminUpdateUserSchema.parse(body);

    if (Object.keys(updates).length === 0) {
      throw new ApiError("No changes provided", 400);
    }

    // ========================================================
    // FIND TARGET USER
    // ========================================================

    const target = await db.query.users.findFirst({
      where: {
        id,
      },
    });

    if (!target) {
      throw new ApiError("Customer not found", 404);
    }

    // ========================================================
    // ROLE SECURITY
    // ========================================================

    // Admin cannot modify their own account here
    if (target.id === admin.id) {
      throw new ApiError(
        "You cannot modify your own account here",
        403,
      );
    }

    // Super admin cannot be modified
    if (target.role === "super_admin") {
      throw new ApiError(
        "Super admin accounts cannot be modified",
        403,
      );
    }

    // Normal admin cannot modify another admin
    if (
      target.role === "admin" &&
      admin.role !== "super_admin"
    ) {
      throw new ApiError(
        "Only a super admin can modify another admin's account",
        403,
      );
    }

    // Only super admin can change roles
    if (
      updates.role !== undefined &&
      admin.role !== "super_admin"
    ) {
      throw new ApiError(
        "Only a super admin can change user roles",
        403,
      );
    }

    // ========================================================
    // UPDATE DATABASE
    // ========================================================

    const [updated] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    // ========================================================
    // SYNC ROLE WITH CLERK
    // ========================================================

    if (updates.role !== undefined) {
      try {
        const client = await clerkClient();

        await client.users.updateUserMetadata(
          target.clerkId,
          {
            publicMetadata: {
              role: updates.role,
            },
          },
        );
      } catch (clerkError) {
        console.error(
          "[CLERK_METADATA_SYNC_FAILED]",
          clerkError,
        );
      }
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return Response.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}