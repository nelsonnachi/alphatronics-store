import { NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";

import { inventoryMovements, products } from "@/db/schema";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { requireAdmin, requireUser } from "@/lib/APIs/auth";

import { updateInventorySchema } from "@/lib/zod-validations/admin-inventory";

export const runtime = "nodejs";

// ============================================================
// STOCK STATUS
// ============================================================

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

function getStockStatus(
  availableStock: number,
  lowStockThreshold: number,
): StockStatus {
  if (availableStock === 0) {
    return "out_of_stock";
  }

  if (availableStock <= lowStockThreshold) {
    return "low_stock";
  }

  return "in_stock";
}

// ============================================================
// GET /api/admin/inventory/[id]
// ============================================================

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    // ==========================================================
    // STEP 1: ADMIN ONLY
    // ==========================================================

    await requireAdmin();

    // ==========================================================
    // STEP 2: GET PRODUCT ID
    // ==========================================================

    const { id } = await context.params;

    if (!id) {
      throw new ApiError("Product ID is required", 400);
    }

    // ==========================================================
    // STEP 3: FIND PRODUCT
    // ==========================================================

    const product = await db.query.products.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: {
          isNull: true,
        },
      },

      columns: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        reservedStock: true,
        lowStockThreshold: true,
        stockStatus: true,
        isActive: true,
      },

      with: {
        variants: {
          where: {
            isActive: true,
          },

          columns: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            reservedStock: true,
            imageUrl: true,
            attributes: true,
            isActive: true,
          },
        },
      },
    });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // ==========================================================
    // STEP 4: CHECK ACTIVE VARIANTS
    // ==========================================================

    const activeVariants = product.variants;

    // ==========================================================
    // CASE A: PRODUCT HAS VARIANTS
    // ==========================================================

    if (activeVariants.length > 0) {
      const variants = activeVariants.map((variant) => {
        const availableStock = Math.max(
          variant.stock - variant.reservedStock,
          0,
        );

        return {
          id: variant.id,
          name: variant.name,
          sku: variant.sku,

          stock: variant.stock,
          reservedStock: variant.reservedStock,

          availableStock,

          lowStockThreshold: product.lowStockThreshold,

          stockStatus: getStockStatus(
            availableStock,
            product.lowStockThreshold,
          ),

          imageUrl: variant.imageUrl,

          attributes: variant.attributes,

          isActive: variant.isActive,
        };
      });

      // ========================================================
      // CALCULATE VARIANT TOTALS
      // ========================================================

      let physicalStock = 0;
      let reservedStock = 0;
      let availableStock = 0;

      let lowStockItems = 0;
      let outOfStockItems = 0;

      for (const variant of variants) {
        physicalStock += variant.stock;

        reservedStock += variant.reservedStock;

        availableStock += variant.availableStock;

        if (variant.stockStatus === "low_stock") {
          lowStockItems++;
        }

        if (variant.stockStatus === "out_of_stock") {
          outOfStockItems++;
        }
      }

      return Response.json({
        success: true,

        data: {
          product: {
            id: product.id,
            name: product.name,
            sku: product.sku,
            isActive: product.isActive,

            inventoryType: "variant",
          },

          inventory: {
            physicalStock,
            reservedStock,
            availableStock,

            lowStockItems,
            outOfStockItems,

            totalVariants: variants.length,
          },

          variants,
        },
      });
    }

    // ==========================================================
    // CASE B: PRODUCT HAS NO VARIANTS
    // ==========================================================

    const availableStock = Math.max(product.stock - product.reservedStock, 0);

    return Response.json({
      success: true,

      data: {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          isActive: product.isActive,

          inventoryType: "product",
        },

        inventory: {
          physicalStock: product.stock,

          reservedStock: product.reservedStock,

          availableStock,

          lowStockThreshold: product.lowStockThreshold,

          stockStatus: getStockStatus(
            availableStock,
            product.lowStockThreshold,
          ),

          totalVariants: 0,
        },

        variants: [],
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// PATCH /api/admin/inventory/[id]
// ============================================================
//
// Updates PRODUCT-LEVEL inventory.
//
// IMPORTANT:
// Every real inventory change also creates an
// inventory_movements record.
//
// This route is ONLY for products without active variants.
// ============================================================

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    // ==========================================================
    // STEP 1: ADMIN ONLY
    // ==========================================================

    await requireAdmin();

    // ==========================================================
    // STEP 2: GET PRODUCT ID
    // ==========================================================

    const { id } = await context.params;

    if (!id) {
      throw new ApiError("Product ID is required", 400);
    }

    // ==========================================================
    // STEP 3: READ REQUEST BODY
    // ==========================================================

    const body = await req.json();

    const input = updateInventorySchema.parse(body);

    // ==========================================================
    // STEP 4: GET CURRENT ADMIN USER
    // ==========================================================
    //
    // We need the database user's ID because
    // inventoryMovements.userId references users.id.
    //

    const adminUser = await requireUser();

    // ==========================================================
    // STEP 5: FIND PRODUCT
    // ==========================================================

    const product = await db.query.products.findFirst({
      where: {
        id,

        deletedAt: {
          isNull: true,
        },
      },

      columns: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        reservedStock: true,
        lowStockThreshold: true,
      },

      with: {
        variants: {
          where: {
            isActive: true,
          },

          columns: {
            id: true,
          },
        },
      },
    });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // ==========================================================
    // STEP 6: PRODUCT WITH VARIANTS
    // ==========================================================
    //
    // Product-level stock is NOT used when variants exist.
    //

    if (product.variants.length > 0) {
      throw new ApiError(
        "This product uses variant inventory. Update the variant stock instead.",
        400,
      );
    }

    // ==========================================================
    // STEP 7: CALCULATE NEW VALUES
    // ==========================================================

    const oldStock = product.stock;

    const oldReservedStock = product.reservedStock;

    const newStock = input.stock ?? oldStock;

    const newReservedStock = input.reservedStock ?? oldReservedStock;

    const newLowStockThreshold =
      input.lowStockThreshold ?? product.lowStockThreshold;

    // ==========================================================
    // STEP 8: VALIDATE RESERVED STOCK
    // ==========================================================

    if (newReservedStock > newStock) {
      throw new ApiError(
        "Reserved stock cannot be greater than physical stock",
        400,
      );
    }

    // ==========================================================
    // STEP 9: CALCULATE AVAILABLE STOCK + STATUS
    // ==========================================================

    const newAvailableStock = Math.max(newStock - newReservedStock, 0);

    const stockStatus = getStockStatus(newAvailableStock, newLowStockThreshold);

    // ==========================================================
    // STEP 10: CHECK WHETHER INVENTORY ACTUALLY CHANGED
    // ==========================================================

    const stockChanged = newStock !== oldStock;

    const reservedStockChanged = newReservedStock !== oldReservedStock;

    const inventoryChanged = stockChanged || reservedStockChanged;

    // ==========================================================
    // STEP 11: DATABASE TRANSACTION
    // ==========================================================
    //
    // The product update and movement creation happen together.
    //
    // If one fails, the transaction rolls everything back.
    //

    const result = await db.transaction(async (tx) => {
      // ----------------------------------------------------
      // UPDATE PRODUCT
      // ----------------------------------------------------

      const [updatedProduct] = await tx
        .update(products)
        .set({
          stock: newStock,

          reservedStock: newReservedStock,

          lowStockThreshold: newLowStockThreshold,

          stockStatus,

          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning({
          id: products.id,
          name: products.name,
          sku: products.sku,

          stock: products.stock,

          reservedStock: products.reservedStock,

          lowStockThreshold: products.lowStockThreshold,

          stockStatus: products.stockStatus,

          updatedAt: products.updatedAt,
        });

      if (!updatedProduct) {
        throw new ApiError("Inventory update failed", 500);
      }

      // ----------------------------------------------------
      // CREATE MOVEMENT
      // ----------------------------------------------------
      //
      // Only create a movement when physical stock changes.
      //
      // A reserved-stock-only change is not a physical
      // inventory movement, so we don't record it as
      // purchase/sale/adjustment.
      //

      let movement = null;

      if (stockChanged) {
        const quantity = newStock - oldStock;

        movement = await tx
          .insert(inventoryMovements)
          .values({
            productId: product.id,

            variantId: null,

            userId: adminUser.id,

            orderId: null,

            type: "adjustment",

            quantity,

            stockBefore: oldStock,

            stockAfter: newStock,

            reservedStockBefore: oldReservedStock,

            reservedStockAfter: newReservedStock,

            reason: "Manual inventory adjustment",

            metadata: {
              source: "admin_inventory",

              stockChanged,

              reservedStockChanged,

              previousLowStockThreshold: product.lowStockThreshold,

              newLowStockThreshold,
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
        updatedProduct,
        movement,
      };
    });

    // ==========================================================
    // STEP 12: RESPONSE
    // ==========================================================

    return Response.json({
      success: true,

      data: {
        ...result.updatedProduct,

        availableStock: newAvailableStock,

        movement: result.movement,
      },

      message: inventoryChanged
        ? "Inventory updated successfully"
        : "Inventory values saved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
