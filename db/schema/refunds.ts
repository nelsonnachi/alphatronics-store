import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
  uniqueIndex,
  jsonb,
  check,
} from "drizzle-orm/pg-core";
import { gt } from "drizzle-orm";
import { payments } from "./payments";
import { orders } from "./orders";
import { refundStatusEnum } from "./enums";

export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Cannot delete a payment or order that has a refund on record
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "restrict" }),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),

    // Matches the precision used everywhere else in the schema
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("NGN"),

    providerRefundId: text("provider_refund_id"),

    status: refundStatusEnum("status").notNull().default("pending"),

    reason: text("reason"),
    customerNote: text("customer_note"),
    merchantNote: text("merchant_note"), // internal only — never show to customers

    rawResponse: jsonb("raw_response"),

    processedAt: timestamp("processed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    paymentIdx: index("refunds_payment_id_idx").on(table.paymentId),
    orderIdx: index("refunds_order_id_idx").on(table.orderId),

    // Unique so the same provider refund can't be recorded twice, but allows many NULLs
    providerRefundUniqueIdx: uniqueIndex("refunds_provider_refund_unique_idx").on(table.providerRefundId),

    amountCheck: check("refunds_amount_check", gt(table.amount, "0")),
  }),
);