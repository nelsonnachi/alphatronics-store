import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminOrders,
  getAdminOrder,
  updateAdminOrder,
  refundOrder,
} from "./admin-order-api";

import type {
  AdminOrderQueryParams,
  AdminOrdersResponse,
  AdminOrderResponse,
  UpdateAdminOrderInput,
  UpdateAdminOrderResponse,
  RefundOrderInput,
  RefundOrderResponse,
} from "./order-types";

import { orderKeys } from "./order-keys";

// ============================================================
// GET ADMIN ORDERS
// ============================================================

export function useAdminOrders(
  params: AdminOrderQueryParams = {},
) {
  return useQuery<AdminOrdersResponse>({
    queryKey:
      orderKeys.adminList(params),

    queryFn: () =>
      getAdminOrders(params),
  });
}

// ============================================================
// GET SINGLE ADMIN ORDER
// ============================================================

export function useAdminOrder(
  id: string,
) {
  return useQuery<AdminOrderResponse>({
    queryKey:
      orderKeys.adminDetail(id),

    queryFn: () =>
      getAdminOrder(id),

    enabled: Boolean(id),
  });
}

// ============================================================
// UPDATE ORDER
// ============================================================

export type UpdateAdminOrderVariables = {
  id: string;

  data: UpdateAdminOrderInput;
};

export function useUpdateAdminOrder() {
  const queryClient =
    useQueryClient();

  return useMutation<
    UpdateAdminOrderResponse,
    Error,
    UpdateAdminOrderVariables
  >({
    mutationFn: ({
      id,
      data,
    }) =>
      updateAdminOrder(
        id,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          orderKeys.adminAll,
      });

      queryClient.invalidateQueries({
        queryKey:
          orderKeys.adminDetail(
            variables.id,
          ),
      });
    },
  });
}

// ============================================================
// REFUND ORDER
// ============================================================

export type RefundOrderVariables = {
  id: string;

  data: RefundOrderInput;
};

export function useRefundOrder() {
  const queryClient =
    useQueryClient();

  return useMutation<
    RefundOrderResponse,
    Error,
    RefundOrderVariables
  >({
    mutationFn: ({
      id,
      data,
    }) =>
      refundOrder(
        id,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          orderKeys.adminAll,
      });

      queryClient.invalidateQueries({
        queryKey:
          orderKeys.adminDetail(
            variables.id,
          ),
      });
    },
  });
}