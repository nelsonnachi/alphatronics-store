"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminRefund,
  getAdminRefunds,
} from "./admin-refund-api";

import {
  adminRefundKeys,
} from "./admin-refund-key";



import type {
  CreateAdminRefundInput,
} from "./admin-refund-types";
import { adminPaymentKeys } from "../admin-payment-keys";

// ============================================================
// GET REFUNDS FOR AN ORDER
// ============================================================

export function useAdminRefunds(
  orderId: string,
) {
  return useQuery({
    queryKey:
      adminRefundKeys.byOrder(
        orderId,
      ),

    queryFn: () =>
      getAdminRefunds(
        orderId,
      ),

    enabled:
      Boolean(orderId),

    staleTime:
      30 * 1000,
  });
}

// ============================================================
// CREATE REFUND MUTATION
// ============================================================

export function useCreateAdminRefund() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateAdminRefundInput,
    ) =>
      createAdminRefund(
        input,
      ),

    onSuccess: (
      _response,
      variables,
    ) => {
      // ------------------------------------------------------
      // REFRESH REFUNDS FOR THIS ORDER
      // ------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey:
          adminRefundKeys.byOrder(
            variables.orderId,
          ),
      });

      // ------------------------------------------------------
      // REFRESH ALL REFUND QUERIES
      // ------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey:
          adminRefundKeys.all,
      });

      // ------------------------------------------------------
      // REFRESH ADMIN PAYMENT QUERIES
      //
      // Refunds can change:
      //
      // payment.status
      // payment.refundedAmount
      // payment.refundedAt
      // ------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey:
          adminPaymentKeys.all,
      });

      // ------------------------------------------------------
      // REFRESH ADMIN ORDER QUERIES
      //
      // A full refund can change:
      //
      // order.status
      // order.paymentStatus
      // ------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey: [
          "admin-orders",
        ],
      });
    },
  });
}