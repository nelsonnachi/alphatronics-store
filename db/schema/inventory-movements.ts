// db/schema/inventory-movements.ts

import {
  pgTable,
  pgEnum,
  text,
  uuid,
  integer,
  timestamp,
  index,
  check,
  jsonb,
} from "drizzle-orm/pg-core";
import { ne, gte } from "drizzle-orm";
import { products, productVariants } from "./products";
import { users } from "./users";
import { orders } from "./orders";

// Describes what happened to the inventory.
export const inventoryMovementTypeEnum = pgEnum("inventory_movement_type", [
  "purchase",
  "adjustment",
  "sale",
  "return",
  "release",
  "damage",
  "restock",
]);

// Records every meaningful change to inventory.
// Positive quantity = stock increased, negative = stock decreased.
// Examples: +20 purchase, -2 sale, +2 return, -5 adjustment
export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),

    // NULL means the movement belongs directly to the main product
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),

    // NULL is allowed for automatic system movements (e.g. a payment webhook)
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    // Optional link to the order that caused this movement (sale, return, etc.)
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),

    type: inventoryMovementTypeEnum("type").notNull(),

    // The actual quantity change (never zero — a movement must change something)
    quantity: integer("quantity").notNull(),

    stockBefore: integer("stock_before").notNull(),
    stockAfter: integer("stock_after").notNull(),
    reservedStockBefore: integer("reserved_stock_before").notNull(),
    reservedStockAfter: integer("reserved_stock_after").notNull(),

    reason: text("reason"), // e.g. "Initial stock received from supplier"

    // jsonb (not text) so we can store and query structured extra data
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("inventory_movements_product_idx").on(table.productId),
    variantIdx: index("inventory_movements_variant_idx").on(table.variantId),
    userIdx: index("inventory_movements_user_idx").on(table.userId),
    orderIdx: index("inventory_movements_order_idx").on(table.orderId),
    typeIdx: index("inventory_movements_type_idx").on(table.type),
    createdAtIdx: index("inventory_movements_created_at_idx").on(table.createdAt),

    // Guard rails: a movement must actually move something,
    // and stock levels can never go negative
    quantityNotZeroCheck: check("inventory_movements_quantity_not_zero_check", ne(table.quantity, 0)),
    stockBeforeCheck: check("inventory_movements_stock_before_check", gte(table.stockBefore, 0)),
    stockAfterCheck: check("inventory_movements_stock_after_check", gte(table.stockAfter, 0)),
    reservedStockBeforeCheck: check("inventory_movements_reserved_before_check", gte(table.reservedStockBefore, 0)),
    reservedStockAfterCheck: check("inventory_movements_reserved_after_check", gte(table.reservedStockAfter, 0)),
  }),
);