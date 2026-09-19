import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";

import { inventoryMovements } from "@/db/schema";

import {
  ApiError,
  handleApiError,
} from "@/lib/APIs/api-errors";

import { requireAdmin } from "@/lib/APIs/auth";

import {
  adminInventoryMovementQuerySchema,
} from "@/lib/zod-validations/admin-inventory";

export const runtime = "nodejs";

// ============================================================
// GET /api/admin/inventory/movements
// ============================================================

export async function GET(
  req: NextRequest,
) {
  try {
    // ==========================================================
    // STEP 1: ADMIN ONLY
    // ==========================================================

    await requireAdmin();

    // ==========================================================
    // STEP 2: READ QUERY PARAMETERS
    // ==========================================================

    const rawParams =
      Object.fromEntries(
        req.nextUrl.searchParams,
      );

    const query =
      adminInventoryMovementQuerySchema.parse(
        rawParams,
      );

    // ==========================================================
    // STEP 3: BUILD FILTERS
    // ==========================================================

    const filters: Record<
      string,
      unknown
    >[] = [];

    // ----------------------------------------------------------
    // PRODUCT FILTER
    // ----------------------------------------------------------

    if (query.productId) {
      filters.push({
        productId: query.productId,
      });
    }

    // ----------------------------------------------------------
    // VARIANT FILTER
    // ----------------------------------------------------------

    if (query.variantId) {
      filters.push({
        variantId: query.variantId,
      });
    }

    // ----------------------------------------------------------
    // MOVEMENT TYPE FILTER
    // ----------------------------------------------------------

    if (query.type) {
      filters.push({
        type: query.type,
      });
    }

    // ----------------------------------------------------------
    // FROM DATE
    // ----------------------------------------------------------

    if (query.from) {
      filters.push({
        createdAt: {
          gte: new Date(
            query.from,
          ),
        },
      });
    }

    // ----------------------------------------------------------
    // TO DATE
    // ----------------------------------------------------------

    if (query.to) {
      filters.push({
        createdAt: {
          lte: new Date(
            query.to,
          ),
        },
      });
    }

    // ----------------------------------------------------------
    // DIRECTION
    // ----------------------------------------------------------

    if (
      query.direction ===
      "increase"
    ) {
      filters.push({
        quantity: {
          gte: 1,
        },
      });
    }

    if (
      query.direction ===
      "decrease"
    ) {
      filters.push({
        quantity: {
          lte: -1,
        },
      });
    }

    // ==========================================================
    // STEP 4: GET MOVEMENTS
    // ==========================================================

    const movements =
      await db.query.inventoryMovements.findMany(
        {
          where:
            filters.length > 0
              ? {
                  AND: filters,
                }
              : undefined,

          columns: {
            id: true,

            productId: true,

            variantId: true,

            userId: true,

            orderId: true,

            type: true,

            quantity: true,

            stockBefore: true,

            stockAfter: true,

            reservedStockBefore: true,

            reservedStockAfter: true,

            reason: true,

            metadata: true,

            createdAt: true,
          },

          with: {
            // --------------------------------------------------
            // PRODUCT
            // --------------------------------------------------

            product: {
              columns: {
                id: true,
                name: true,
                sku: true,
              },
            },

            // --------------------------------------------------
            // VARIANT
            // --------------------------------------------------

            variant: {
              columns: {
                id: true,
                name: true,
                sku: true,
              },
            },

            // --------------------------------------------------
            // ADMIN / USER
            // --------------------------------------------------

            user: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            // --------------------------------------------------
            // ORDER
            // --------------------------------------------------

            order: {
              columns: {
                id: true,
                orderNumber: true,
              },
            },
          },

          orderBy:
            query.sort === "oldest"
              ? {
                  createdAt: "asc",
                }
              : {
                  createdAt: "desc",
                },
        },
      );

    // ==========================================================
    // STEP 5: SEARCH
    // ==========================================================

    let results = movements;

    if (query.search) {
      const search =
        query.search.toLowerCase();

      results =
        movements.filter(
          (movement) => {
            const productName =
              movement.product?.name?.toLowerCase() ??
              "";

            const productSku =
              movement.product?.sku?.toLowerCase() ??
              "";

            const variantName =
              movement.variant?.name?.toLowerCase() ??
              "";

            const variantSku =
              movement.variant?.sku?.toLowerCase() ??
              "";

            const reason =
              movement.reason?.toLowerCase() ??
              "";

            return (
              productName.includes(
                search,
              ) ||
              productSku.includes(
                search,
              ) ||
              variantName.includes(
                search,
              ) ||
              variantSku.includes(
                search,
              ) ||
              reason.includes(
                search,
              )
            );
          },
        );
    }

    // ==========================================================
    // STEP 6: CALCULATE SUMMARY
    // ==========================================================

    let totalIncreased = 0;

    let totalDecreased = 0;

    let netQuantityChange = 0;

    for (const movement of results) {
      if (movement.quantity > 0) {
        totalIncreased +=
          movement.quantity;
      }

      if (movement.quantity < 0) {
        totalDecreased +=
          Math.abs(
            movement.quantity,
          );
      }

      netQuantityChange +=
        movement.quantity;
    }

    // ==========================================================
    // STEP 7: PAGINATION
    // ==========================================================

    const total =
      results.length;

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total / query.limit,
          );

    const offset =
      (query.page - 1) *
      query.limit;

    const paginatedMovements =
      results.slice(
        offset,
        offset + query.limit,
      );

    // ==========================================================
    // STEP 8: INVALID PAGE
    // ==========================================================

    if (
      query.page > 1 &&
      query.page > totalPages &&
      total > 0
    ) {
      throw new ApiError(
        "Requested page does not exist",
        404,
      );
    }

    // ==========================================================
    // STEP 9: RESPONSE
    // ==========================================================

    return Response.json({
      success: true,

      data: {
        movements:
          paginatedMovements,

        summary: {
          totalMovements: total,

          totalIncreased,

          totalDecreased,

          netQuantityChange,
        },

        pagination: {
          page: query.page,

          limit: query.limit,

          total,

          totalPages,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}