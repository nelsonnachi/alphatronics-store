import { apiClient } from "@/lib/api/client";

import type {
  AdminOrderQueryParams,
  AdminOrdersResponse,
  AdminOrderResponse,
  UpdateAdminOrderInput,
  UpdateAdminOrderResponse,
  RefundOrderInput,
  RefundOrderResponse,
} from "./order-types";

// ============================================================
// GET ADMIN ORDERS
// ============================================================

export async function getAdminOrders(
  params: AdminOrderQueryParams = {},
): Promise<AdminOrdersResponse> {
  const searchParams =
    new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  const queryString =
    searchParams.toString();

  const url = queryString
    ? `/api/admin/orders?${queryString}`
    : "/api/admin/orders";

  return apiClient<AdminOrdersResponse>(
    url,
  );
}

// ============================================================
// GET SINGLE ADMIN ORDER
// ============================================================

export async function getAdminOrder(
  id: string,
): Promise<AdminOrderResponse> {
  return apiClient<AdminOrderResponse>(
    `/api/admin/orders/${id}`,
  );
}

// ============================================================
// UPDATE ADMIN ORDER
// ============================================================

export async function updateAdminOrder(
  id: string,
  data: UpdateAdminOrderInput,
): Promise<UpdateAdminOrderResponse> {
  return apiClient<UpdateAdminOrderResponse>(
    `/api/admin/orders/${id}`,
    {
      method: "PATCH",

      body: JSON.stringify(data),
    },
  );
}

// ============================================================
// REFUND ORDER
// ============================================================

export async function refundOrder(
  id: string,
  data: RefundOrderInput,
): Promise<RefundOrderResponse> {
  return apiClient<RefundOrderResponse>(
    `/api/admin/orders/${id}/refund`,
    {
      method: "POST",

      body: JSON.stringify(data),
    },
  );
}