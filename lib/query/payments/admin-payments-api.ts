// lib/payments/admin-payments-api.ts



import { apiClient } from "@/lib/api/client";
import type {
    AdminPaymentDetail,
  AdminPaymentsQuery,
  AdminPaymentsResponse,
} from "./admin-payments-types";

// ==========================================================
// GET ADMIN PAYMENTS
// ==========================================================

export async function getAdminPayments(
  query: AdminPaymentsQuery = {},
) {
  const params =
    new URLSearchParams();

  // --------------------------------------------------------
  // PAGE
  // --------------------------------------------------------

  if (query.page !== undefined) {
    params.set(
      "page",
      String(query.page),
    );
  }

  // --------------------------------------------------------
  // LIMIT
  // --------------------------------------------------------

  if (query.limit !== undefined) {
    params.set(
      "limit",
      String(query.limit),
    );
  }

  // --------------------------------------------------------
  // SEARCH
  // --------------------------------------------------------

  if (
    query.search &&
    query.search.trim()
  ) {
    params.set(
      "search",
      query.search.trim(),
    );
  }

  // --------------------------------------------------------
  // STATUS
  // --------------------------------------------------------

  if (query.status) {
    params.set(
      "status",
      query.status,
    );
  }

  const queryString =
    params.toString();

  const url =
    queryString.length > 0
      ? `/api/admin/payments?${queryString}`
      : "/api/admin/payments";

  return apiClient<AdminPaymentsResponse>(
    url,
    {
      method: "GET",
    },
  );
}

// ==========================================================
// GET ADMIN PAYMENT DETAIL
// ==========================================================

export async function getAdminPayment(
  paymentId: string,
) {
  return apiClient<{
    data: AdminPaymentDetail;
  }>(
    `/api/admin/payments/${paymentId}`,
    {
      method: "GET",
    },
  );
}