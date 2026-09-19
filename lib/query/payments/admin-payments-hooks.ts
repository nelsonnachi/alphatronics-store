// lib/payments/admin-payments-hooks.ts

"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
    getAdminPayment,
  getAdminPayments,
} from "./admin-payments-api";

import {
  adminPaymentKeys,
} from "./admin-payment-keys";

import type {
  AdminPaymentsQuery,
} from "./admin-payments-types";

// ==========================================================
// ADMIN PAYMENTS LIST
// ==========================================================

export function useAdminPayments(
  query: AdminPaymentsQuery = {},
) {
  return useQuery({
    queryKey:
      adminPaymentKeys.list(
        query,
      ),

    queryFn: () =>
      getAdminPayments(
        query,
      ),

    placeholderData:
      (previousData) =>
        previousData,

    staleTime:
      60 * 1000,
  });
}

// ==========================================================
// ADMIN PAYMENT DETAIL
// ==========================================================

export function useAdminPayment(
  paymentId: string,
) {
  return useQuery({
    queryKey:
      adminPaymentKeys.detail(
        paymentId,
      ),

    queryFn: () =>
      getAdminPayment(
        paymentId,
      ),

    enabled:
      Boolean(paymentId),

    staleTime:
      60 * 1000,
  });
}