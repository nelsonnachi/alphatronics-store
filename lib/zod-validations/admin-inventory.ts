import { z } from "zod";

/**
 * ============================================================
 * ADMIN INVENTORY QUERY
 * ============================================================
 *
 * GET /api/admin/inventory
 *
 * Supports:
 * - pagination
 * - search
 * - stock status
 * - minimum stock
 * - maximum stock
 * - product / variant type
 * - sorting
 */

export const adminInventoryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    /**
     * Searches:
     *
     * Product name
     * Product SKU
     * Variant name
     * Variant SKU
     */
    search: z.string().trim().min(1).optional(),

    /**
     * Inventory status.
     */
    status: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),

    /**
     * Minimum available stock.
     */
    minStock: z.coerce.number().int().min(0).optional(),

    /**
     * Maximum available stock.
     */
    maxStock: z.coerce.number().int().min(0).optional(),

    /**
     * Inventory item type.
     *
     * product:
     *   Product owns its inventory.
     *
     * variant:
     *   Variant owns its inventory.
     */
    type: z.enum(["product", "variant"]).optional(),

    /**
     * Inventory sorting.
     */
    sort: z
      .enum([
        "stock_asc",
        "stock_desc",
        "name_asc",
        "name_desc",
        "newest",
        "oldest",
      ])
      .default("stock_asc"),
  })
  .refine(
    (data) =>
      data.minStock === undefined ||
      data.maxStock === undefined ||
      data.minStock <= data.maxStock,
    {
      message: "Minimum stock cannot be greater than maximum stock",

      path: ["minStock"],
    }
  );

/**
 * ============================================================
 * UPDATE INVENTORY
 * ============================================================
 *
 * Used by:
 *
 * PATCH /api/admin/inventory/[id]
 *
 * AND
 *
 * PATCH /api/admin/inventory/[id]/variants/[variantId]
 *
 * Product route uses:
 * - stock
 * - reservedStock
 * - lowStockThreshold
 *
 * Variant route uses:
 * - stock
 * - reservedStock
 *
 * The variant route simply ignores lowStockThreshold.
 */

export const updateInventorySchema = z
  .object({
    stock: z.coerce.number().int().min(0).optional(),

    reservedStock: z.coerce.number().int().min(0).optional(),

    lowStockThreshold: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) =>
      data.stock !== undefined ||
      data.reservedStock !== undefined ||
      data.lowStockThreshold !== undefined,
    {
      message: "At least one inventory field must be provided",
    }
  );

  export const adminInventoryMovementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().min(1).optional(),

  productId: z.string().uuid().optional(),

  variantId: z.string().uuid().optional(),

  type: z
    .enum([
      "purchase",
      "adjustment",
      "sale",
      "return",
      "release",
      "damage",
      "restock",
    ])
    .optional(),

  direction: z
    .enum(["increase", "decrease"])
    .optional(),

  from: z.string().datetime().optional(),

  to: z.string().datetime().optional(),

  sort: z
    .enum(["newest", "oldest"])
    .default("newest"),
});


/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export type AdminInventoryQuery = z.infer<typeof adminInventoryQuerySchema>;

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

export type AdminInventoryMovementQuery = z.infer<
  typeof adminInventoryMovementQuerySchema
>;