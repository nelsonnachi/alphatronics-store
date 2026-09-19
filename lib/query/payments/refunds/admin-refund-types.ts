// ============================================================
// REFUND STATUS
// ============================================================

export type AdminRefundStatus =
  | "pending"
  | "processing"
  | "processed"
  | "failed";

// ============================================================
// CREATE REFUND INPUT
// ============================================================

export type CreateAdminRefundInput = {
  orderId: string;

  // Optional.
  // If omitted, the remaining refundable amount is refunded.
  amount?: number;

  reason?: string;

  customerNote?: string;

  // Internal admin note
  merchantNote?: string;
};

// ============================================================
// ADMIN REFUND
// ============================================================

export type AdminRefund = {
  id: string;

  paymentId: string;

  orderId: string;

  amount: string;

  currency: string;

  providerRefundId: string | null;

  status: AdminRefundStatus;

  reason: string | null;

  customerNote: string | null;

  merchantNote: string | null;

  processedAt: string | null;

  failedAt: string | null;

  createdAt: string;

  updatedAt: string;
};

// ============================================================
// CREATE REFUND RESPONSE
// ============================================================

export type CreateAdminRefundResponse = {
  success: boolean;

  data: AdminRefund;

  message: string;
};

// ============================================================
// GET REFUNDS RESPONSE
// ============================================================

export type GetAdminRefundsResponse = {
  success: boolean;

  data: AdminRefund[];

  message?: string;
};