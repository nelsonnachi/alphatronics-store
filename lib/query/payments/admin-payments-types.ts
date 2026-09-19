

// ============================================================
// PAYMENT STATUS
// ============================================================

import { AdminRefundStatus } from "./refunds/admin-refund-types";

export type AdminPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "partially_refunded"
  | "refunded";

// ============================================================
// PAYMENT PROVIDER
// ============================================================

export type AdminPaymentProvider = "paystack" | "cod";

// ============================================================
// ADMIN PAYMENT
// ============================================================

export type AdminPayment = {
  id: string;

  orderId: string;

  provider: AdminPaymentProvider;

  reference: string | null;

  amount: string;

  currency: string;

  status: AdminPaymentStatus;

  refundedAmount: string;

  paidAt: string | null;

  failedAt: string | null;

  refundedAt: string | null;

  createdAt: string;

  orderNumber: string | null;

  customerEmail: string | null;
};

// ============================================================
// PAGINATION
// ============================================================

export type AdminPaymentsPagination = {
  page: number;

  limit: number;

  hasNextPage: boolean;
};

// ============================================================
// PAYMENT LIST RESPONSE
// ============================================================

export type AdminPaymentsResponse = {
  data: AdminPayment[];

  pagination: AdminPaymentsPagination;
};

// ============================================================
// PAYMENT QUERY PARAMETERS
// ============================================================

export type AdminPaymentsQuery = {
  page?: number;

  limit?: number;

  search?: string;

  status?: AdminPaymentStatus;
};

// ============================================================
// PAYMENT DETAIL
// ============================================================

export type AdminPaymentDetail = {
  payment: AdminPayment;

  order: {
    id: string;

    orderNumber: string;

    userId: string | null;

    subtotal: string;

    tax: string;

    shippingFee: string;

    discount: string;

    total: string;

    currency: string;

    status: string;

    paymentStatus: string;

    paidAt: string | null;

    createdAt: string;
  };

  customer: {
    id: string;

    email: string;

    firstName: string | null;

    lastName: string | null;
  } | null;

  items: AdminPaymentOrderItem[];

  refunds: AdminPaymentRefund[];
};

// ============================================================
// PAYMENT ORDER ITEM
// ============================================================

export type AdminPaymentOrderItem = {
  id: string;

  orderId: string;

  productId: string;

  variantId: string | null;

  productName: string;

  quantity: number;

  unitPrice: string;

  totalPrice: string;
};

// ============================================================
// PAYMENT REFUND
// ============================================================

export type AdminPaymentRefund = {
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
