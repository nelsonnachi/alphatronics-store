// db/schema/payments.ts

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
import { gte, lte } from "drizzle-orm";
import { orders } from "./orders";
import { paymentStatusEnum, paymentMethodEnum } from "./enums";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    provider: text("provider").notNull(), // e.g. "paystack", "stripe"

    // The provider's own ID for this payment (nullable until the provider responds)
    providerPaymentId: text("provider_payment_id"),

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    refundedAmount: numeric("refunded_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),

    currency: text("currency").notNull().default("NGN"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    method: paymentMethodEnum("method").notNull(),

    rawResponse: jsonb("raw_response"), // full response from the payment provider, for debugging

    paidAt: timestamp("paid_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orderIdx: index("payments_order_idx").on(table.orderId),

    // ONE index for providerPaymentId — unique, but allows many NULLs
    // (multiple pending payments can exist before a provider ID is assigned)
    providerPaymentUniqueIdx: uniqueIndex("payments_provider_payment_unique_idx").on(table.providerPaymentId),

    // Guard rails
    amountCheck: check("payments_amount_check", gte(table.amount, "0")),
    refundedAmountCheck: check("payments_refunded_amount_check", gte(table.refundedAmount, "0")),
    refundedNotOverAmountCheck: check("payments_refunded_not_over_amount_check", lte(table.refundedAmount, table.amount)),
  }),
);