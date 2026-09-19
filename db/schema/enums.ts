import { pgEnum } from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "bank_transfer",
  "cash_on_delivery",
]);

export const refundStatusEnum = pgEnum("refund_status", [
  "pending",
  "processing",
  "processed",
  "failed",
]);