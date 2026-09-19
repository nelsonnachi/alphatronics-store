import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { gt, gte } from "drizzle-orm";
import { users } from "./users";
import { addresses, addressTypeEnum } from "./addresses";
import { products, productVariants } from "./products";
import { coupons } from "./coupons";
import { paymentStatusEnum, paymentMethodEnum } from "./enums";

// ORDER STATUS ENUM
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
  "failed",
]);

// ORDERS
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("NGN"),

    couponId: uuid("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),

    // --- Payment (separate lifecycle from fulfillment status) ---
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    // Pointers to the user's saved addresses (just for reference —
    // the real frozen copy lives in orderAddressSnapshots below).
    shippingAddressId: uuid("shipping_address_id").references(
      () => addresses.id,
      { onDelete: "set null" }
    ),
    billingAddressId: uuid("billing_address_id").references(
      () => addresses.id,
      { onDelete: "set null" }
    ),

    customerNote: text("customer_note"),
    adminNote: text("admin_note"), // internal only — never show to customers

    trackingNumber: text("tracking_number"),
    carrier: text("carrier"),

    // --- Lifecycle timestamps ---
    placedAt: timestamp("placed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("orders_user_idx").on(table.userId),
    statusIdx: index("orders_status_idx").on(table.status),
    couponIdx: index("orders_coupon_idx").on(table.couponId),

    // Guard rails: money and totals can never be negative
    subtotalCheck: check("orders_subtotal_check", gte(table.subtotal, "0")),
    shippingCostCheck: check(
      "orders_shipping_cost_check",
      gte(table.shippingCost, "0")
    ),
    taxCheck: check("orders_tax_check", gte(table.tax, "0")),
    discountCheck: check("orders_discount_check", gte(table.discount, "0")),
    totalCheck: check("orders_total_check", gte(table.total, "0")),
  })
);

// ---------------------------------------------------------
// ORDER ADDRESS SNAPSHOTS
// A frozen copy of the shipping/billing address AT THE TIME
// the order was placed. This never changes, even if the
// customer later edits or deletes their saved address.
// ---------------------------------------------------------
export const orderAddressSnapshots = pgTable(
  "order_address_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    type: addressTypeEnum("type").notNull(), // "shipping" or "billing"

    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    addressLine1: text("address_line1").notNull(),
    addressLine2: text("address_line2"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull(),
  },
  (table) => ({
    orderIdx: index("order_address_snapshots_order_idx").on(table.orderId),
  })
);

// ---------------------------------------------------------
// ORDER ITEMS
// One row per product line in an order. Just like the address
// snapshot above, product details are frozen here so an order
// always shows what the customer actually saw and paid,
// even if the product changes or is deleted later.
// ---------------------------------------------------------
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),

    // Variant can be deleted later without breaking this row,
    // since variantName below already preserves what it was called.
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),

    // --- Frozen snapshot of the product at time of purchase ---
    productName: text("product_name").notNull(),
    variantName: text("variant_name"),
    sku: text("sku").notNull(),
    imageUrl: text("image_url"),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),

    quantity: integer("quantity").notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(), // unitPrice * quantity
  },
  (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId),
    productIdx: index("order_items_product_idx").on(table.productId),

    // Guard rails
    quantityCheck: check("order_items_quantity_check", gt(table.quantity, 0)),
    unitPriceCheck: check(
      "order_items_unit_price_check",
      gte(table.unitPrice, "0")
    ),
    subtotalCheck: check(
      "order_items_subtotal_check",
      gte(table.subtotal, "0")
    ),
  })
);
