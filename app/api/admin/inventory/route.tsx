import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";

import { adminInventoryQuerySchema } from "@/lib/zod-validations/admin-inventory";
import { requireAdmin } from "@/lib/APIs/auth";
import { handleApiError } from "@/lib/APIs/api-errors";

export const runtime = "nodejs";

/**
 * GET /api/admin/inventory
 *
 * Returns an overview of inventory across the store.
 *
 * INVENTORY RULE:
 *
 * Product WITHOUT active variants:
 *   -> product.stock is the source of truth
 *
 * Product WITH active variants:
 *   -> variant.stock is the source of truth
 *   -> product.stock is ignored
 *
 * Therefore:
 *
 * Product without variants = 1 inventory row
 * Product with 3 variants   = 3 inventory rows
 */
export async function GET(req: NextRequest) {
  try {
    // ============================================================
    // STEP 1: ONLY ADMINS CAN ACCESS INVENTORY
    // ============================================================

    await requireAdmin();

    // ============================================================
    // STEP 2: READ AND VALIDATE QUERY PARAMETERS
    // ============================================================

    const rawParams = Object.fromEntries(
      req.nextUrl.searchParams,
    );

    const query = adminInventoryQuerySchema.parse(rawParams);

    // ============================================================
    // STEP 3: GET ACTIVE PRODUCTS
    // ============================================================

    const products = await db.query.products.findMany({
      where: {
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
        updatedAt: true,
        createdAt: true,
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
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    // ============================================================
    // STEP 4: TYPES
    // ============================================================

    type StockStatus =
      | "in_stock"
      | "low_stock"
      | "out_of_stock";

    type InventoryItem = {
      productId: string;
      productName: string;
      productSku: string;

      type: "product" | "variant";

      variantId?: string;
      variantName?: string;
      variantSku?: string;

      stock: number;
      reservedStock: number;
      availableStock: number;

      lowStockThreshold: number;
      stockStatus: StockStatus;

      createdAt: Date;
      updatedAt: Date;
    };

    // ============================================================
    // STEP 5: STOCK STATUS HELPER
    // ============================================================

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
    // STEP 6: BUILD INVENTORY LIST
    // ============================================================

    const inventoryItems: InventoryItem[] = [];

    let totalProducts = 0;
    let totalVariants = 0;

    let physicalStock = 0;
    let reservedStockTotal = 0;
    let availableStockTotal = 0;

    let lowStockItems = 0;
    let outOfStockItems = 0;

    for (const product of products) {
      totalProducts++;

      const activeVariants = product.variants;

      // ==========================================================
      // PRODUCT HAS ACTIVE VARIANTS
      // ==========================================================

      if (activeVariants.length > 0) {
        for (const variant of activeVariants) {
          totalVariants++;

          const availableStock = Math.max(
            variant.stock - variant.reservedStock,
            0,
          );

          const stockStatus = getStockStatus(
            availableStock,
            product.lowStockThreshold,
          );

          if (stockStatus === "low_stock") {
            lowStockItems++;
          }

          if (stockStatus === "out_of_stock") {
            outOfStockItems++;
          }

          physicalStock += variant.stock;
          reservedStockTotal += variant.reservedStock;
          availableStockTotal += availableStock;

          inventoryItems.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku,

            type: "variant",

            variantId: variant.id,
            variantName: variant.name,
            variantSku: variant.sku,

            stock: variant.stock,
            reservedStock: variant.reservedStock,
            availableStock,

            lowStockThreshold: product.lowStockThreshold,
            stockStatus,

            createdAt: variant.createdAt,

            // productVariants does not have updatedAt.
            // We therefore use the parent product's updatedAt.
            updatedAt: product.updatedAt,
          });
        }
      }

      // ==========================================================
      // PRODUCT DOES NOT HAVE ACTIVE VARIANTS
      // ==========================================================

      else {
        const availableStock = Math.max(
          product.stock - product.reservedStock,
          0,
        );

        const stockStatus = getStockStatus(
          availableStock,
          product.lowStockThreshold,
        );

        if (stockStatus === "low_stock") {
          lowStockItems++;
        }

        if (stockStatus === "out_of_stock") {
          outOfStockItems++;
        }

        physicalStock += product.stock;
        reservedStockTotal += product.reservedStock;
        availableStockTotal += availableStock;

        inventoryItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,

          type: "product",

          stock: product.stock,
          reservedStock: product.reservedStock,
          availableStock,

          lowStockThreshold: product.lowStockThreshold,
          stockStatus,

          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        });
      }
    }

    // ============================================================
    // STEP 7: SEARCH FILTER
    // ============================================================

    let filtered = inventoryItems;

    if (query.search) {
      const search = query.search.toLowerCase();

      filtered = filtered.filter((item) => {
        const productName =
          item.productName.toLowerCase();

        const productSku =
          item.productSku.toLowerCase();

        const variantName =
          item.variantName?.toLowerCase() ?? "";

        const variantSku =
          item.variantSku?.toLowerCase() ?? "";

        return (
          productName.includes(search) ||
          productSku.includes(search) ||
          variantName.includes(search) ||
          variantSku.includes(search)
        );
      });
    }

    // ============================================================
    // STEP 8: STATUS FILTER
    // ============================================================

    if (query.status) {
      filtered = filtered.filter(
        (item) => item.stockStatus === query.status,
      );
    }

    // ============================================================
    // STEP 9: PRODUCT / VARIANT FILTER
    // ============================================================

    if (query.type) {
      filtered = filtered.filter(
        (item) => item.type === query.type,
      );
    }

    // ============================================================
    // STEP 10: MINIMUM STOCK FILTER
    // ============================================================

    if (query.minStock !== undefined) {
      filtered = filtered.filter(
        (item) =>
          item.availableStock >= query.minStock!,
      );
    }

    // ============================================================
    // STEP 11: MAXIMUM STOCK FILTER
    // ============================================================

    if (query.maxStock !== undefined) {
      filtered = filtered.filter(
        (item) =>
          item.availableStock <= query.maxStock!,
      );
    }

    // ============================================================
    // STEP 12: SORT
    // ============================================================

    switch (query.sort) {
      case "stock_asc":
        filtered.sort(
          (a, b) =>
            a.availableStock - b.availableStock,
        );
        break;

      case "stock_desc":
        filtered.sort(
          (a, b) =>
            b.availableStock - a.availableStock,
        );
        break;

      case "name_asc":
        filtered.sort(
          (a, b) =>
            a.productName.localeCompare(
              b.productName,
            ),
        );
        break;

      case "name_desc":
        filtered.sort(
          (a, b) =>
            b.productName.localeCompare(
              a.productName,
            ),
        );
        break;

      case "newest":
        filtered.sort(
          (a, b) =>
            b.createdAt.getTime() -
            a.createdAt.getTime(),
        );
        break;

      case "oldest":
        filtered.sort(
          (a, b) =>
            a.createdAt.getTime() -
            b.createdAt.getTime(),
        );
        break;
    }

    // ============================================================
    // STEP 13: PAGINATION
    // ============================================================

    const total = filtered.length;

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(total / query.limit);

    const offset =
      (query.page - 1) * query.limit;

    const paginatedInventory =
      filtered.slice(
        offset,
        offset + query.limit,
      );

    // ============================================================
    // STEP 14: RESPONSE
    // ============================================================

    return Response.json({
      success: true,

      data: {
        summary: {
          totalProducts,
          totalVariants,

          totalInventoryItems:
            inventoryItems.length,

          physicalStock,
          reservedStock: reservedStockTotal,
          availableStock: availableStockTotal,

          lowStockItems,
          outOfStockItems,
        },

        inventory: paginatedInventory,

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