import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";

import { inventoryMovements, productVariants } from "@/db/schema";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { requireAdmin, requireUser } from "@/lib/APIs/auth";

import { updateInventorySchema } from "@/lib/zod-validations/admin-inventory";

export const runtime = "nodejs";

// ============================================================
// PATCH /api/admin/inventory/[id]/variants/[variantsId]
// ============================================================
//
// Updates inventory for ONE product variant.
//
// Every real physical-stock change also creates an
// inventory_movements record.
// ============================================================

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
      variantsId: string;
    }>;
  },
) {
  try {
    // ==========================================================
    // STEP 1: ADMIN ONLY
    // ==========================================================

    await requireAdmin();

    // ==========================================================
    // STEP 2: GET IDS FROM URL
    // ==========================================================

    const { id: productId, variantsId } = await context.params;

    if (!productId) {
      throw new ApiError("Product ID is required", 400);
    }

    if (!variantsId) {
      throw new ApiError("Variant ID is required", 400);
    }

    // ==========================================================
    // STEP 3: READ REQUEST BODY
    // ==========================================================

    const body = await req.json();

    const input = updateInventorySchema.parse(body);

    // ==========================================================
    // STEP 4: GET CURRENT ADMIN USER
    // ==========================================================

    const adminUser = await requireUser();

    // ==========================================================
    // STEP 5: FIND VARIANT
    // ==========================================================

    const variant = await db.query.productVariants.findFirst({
      where: {
        id: variantsId,

        productId,

        isActive: true,
      },

      columns: {
        id: true,
        productId: true,
        name: true,
        sku: true,
        stock: true,
        reservedStock: true,
        isActive: true,
        createdAt: true,
      },

      with: {
        product: {
          columns: {
            id: true,
            name: true,
            sku: true,
            lowStockThreshold: true,
            isActive: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!variant) {
      throw new ApiError("Product variant not found", 404);
    }

    // ==========================================================
    // STEP 6: CHECK PARENT PRODUCT
    // ==========================================================

    const product = variant.product;

    if (!product) {
      throw new ApiError("Parent product not found", 404);
    }

    if (!product.isActive || product.deletedAt !== null) {
      throw new ApiError("Product is not available", 400);
    }

    // ==========================================================
    // STEP 7: GET OLD VALUES
    // ==========================================================

    const oldStock = variant.stock;

    const oldReservedStock = variant.reservedStock;

    // ==========================================================
    // STEP 8: CALCULATE NEW VALUES
    // ==========================================================

    const newStock = input.stock ?? oldStock;

    const newReservedStock = input.reservedStock ?? oldReservedStock;

    // ==========================================================
    // STEP 9: VALIDATE RESERVED STOCK
    // ==========================================================

    if (newReservedStock > newStock) {
      throw new ApiError(
        "Reserved stock cannot be greater than physical stock",
        400,
      );
    }

    // ==========================================================
    // STEP 10: CALCULATE AVAILABLE STOCK
    // ==========================================================

    const availableStock = Math.max(newStock - newReservedStock, 0);

    // ==========================================================
    // STEP 11: CALCULATE STOCK STATUS
    // ==========================================================

    let stockStatus: "in_stock" | "low_stock" | "out_of_stock";

    if (availableStock === 0) {
      stockStatus = "out_of_stock";
    } else if (availableStock <= product.lowStockThreshold) {
      stockStatus = "low_stock";
    } else {
      stockStatus = "in_stock";
    }

    // ==========================================================
    // STEP 12: CHECK WHETHER STOCK CHANGED
    // ==========================================================

    const stockChanged = newStock !== oldStock;

    const reservedStockChanged = newReservedStock !== oldReservedStock;

    const inventoryChanged = stockChanged || reservedStockChanged;

    // ==========================================================
    // STEP 13: DATABASE TRANSACTION
    // ==========================================================

    const result = await db.transaction(async (tx) => {
      // ----------------------------------------------------
      // UPDATE VARIANT
      // ----------------------------------------------------

      const [updatedVariant] = await tx
        .update(productVariants)
        .set({
          stock: newStock,

          reservedStock: newReservedStock,
        })
        .where(
          and(
            eq(productVariants.id, variantsId),

            eq(productVariants.productId, productId),

            eq(productVariants.isActive, true),
          ),
        )
        .returning({
          id: productVariants.id,

          productId: productVariants.productId,

          name: productVariants.name,

          sku: productVariants.sku,

          stock: productVariants.stock,

          reservedStock: productVariants.reservedStock,

          isActive: productVariants.isActive,

          createdAt: productVariants.createdAt,
        });

      if (!updatedVariant) {
        throw new ApiError("Variant inventory update failed", 500);
      }

      // ----------------------------------------------------
      // CREATE MOVEMENT
      // ----------------------------------------------------
      //
      // Only physical stock changes create a movement.
      //

      let movement = null;

      if (stockChanged) {
        const quantity = newStock - oldStock;

        movement = await tx
          .insert(inventoryMovements)
          .values({
            productId: productId,

            variantId: variantsId,

            userId: adminUser.id,

            orderId: null,

            type: "adjustment",

            quantity,

            stockBefore: oldStock,

            stockAfter: newStock,

            reservedStockBefore: oldReservedStock,

            reservedStockAfter: newReservedStock,

            reason: "Manual variant inventory adjustment",

            metadata: {
              source: "admin_inventory",

              stockChanged,

              reservedStockChanged,

              lowStockThreshold: product.lowStockThreshold,
            },
          })
          .returning({
            id: inventoryMovements.id,

            productId: inventoryMovements.productId,

            variantId: inventoryMovements.variantId,

            userId: inventoryMovements.userId,

            type: inventoryMovements.type,

            quantity: inventoryMovements.quantity,

            stockBefore: inventoryMovements.stockBefore,

            stockAfter: inventoryMovements.stockAfter,

            reservedStockBefore: inventoryMovements.reservedStockBefore,

            reservedStockAfter: inventoryMovements.reservedStockAfter,

            reason: inventoryMovements.reason,

            metadata: inventoryMovements.metadata,

            createdAt: inventoryMovements.createdAt,
          });

        movement = movement[0] ?? null;
      }

      return {
        updatedVariant,
        movement,
      };
    });

    // ==========================================================
    // STEP 14: RESPONSE
    // ==========================================================

    return Response.json({
      success: true,

      data: {
        ...result.updatedVariant,

        availableStock,

        lowStockThreshold: product.lowStockThreshold,

        stockStatus,

        movement: result.movement,
      },

      message: inventoryChanged
        ? "Variant inventory updated successfully"
        : "Variant inventory values saved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
