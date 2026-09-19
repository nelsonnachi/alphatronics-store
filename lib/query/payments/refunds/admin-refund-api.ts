import { apiClient } from "@/lib/api/client";

import type {
  CreateAdminRefundInput,
  CreateAdminRefundResponse,
  GetAdminRefundsResponse,
} from "./admin-refund-types";

// ============================================================
// CREATE ADMIN REFUND
// ============================================================

export async function createAdminRefund(
  input: CreateAdminRefundInput,
) {
  return apiClient<CreateAdminRefundResponse>(
    `/api/admin/orders/${input.orderId}/refund`,
    {
      method: "POST",

      body: JSON.stringify({
        amount: input.amount,

        reason: input.reason,

        customerNote: input.customerNote,

        merchantNote: input.merchantNote,
      }),
    },
  );
}

// ============================================================
// GET ADMIN REFUNDS FOR AN ORDER
// ============================================================

export async function getAdminRefunds(
  orderId: string,
) {
  return apiClient<GetAdminRefundsResponse>(
    `/api/admin/orders/${orderId}/refund`,
    {
      method: "GET",
    },
  );
}