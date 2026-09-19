import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql, gt } from "drizzle-orm";
import { users } from "./users";
import { products, productVariants } from "./products";

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // One cart per authenticated user
    userIdx: uniqueIndex("carts_user_idx").on(table.userId),
    // One cart per guest session
    sessionIdx: uniqueIndex("carts_session_idx")
      .on(table.sessionId)
      .where(sql`${table.sessionId} IS NOT NULL`),
  })
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull().default(1),
    priceAtAdd: numeric("price_at_add", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    cartIdx: index("cart_items_cart_idx").on(table.cartId),
    productIdx: index("cart_items_product_idx").on(table.productId),
    variantIdx: index("cart_items_variant_idx").on(table.variantId),

    // Products WITH a variant: unique per (cart, product, variant)
    uniqueProductVariant: uniqueIndex("cart_items_unique_product_variant")
      .on(table.cartId, table.productId, table.variantId)
      .where(sql`${table.variantId} IS NOT NULL`),

    // Products WITHOUT a variant: unique per (cart, product)
    // (NULL != NULL in Postgres, so this case needs its own index)
    uniqueProductOnly: uniqueIndex("cart_items_unique_product_only")
      .on(table.cartId, table.productId)
      .where(sql`${table.variantId} IS NULL`),

    quantityCheck: check("cart_items_quantity_check", gt(table.quantity, 0)),
  })
);
