import { apiClient } from "@/lib/api/client";

import type {
  AdminUserDetailsResponse,
  AdminUserQueryParams,
  AdminUsersResponse,
  CurrentUserResponse,
  UpdateAdminUserInput,
  UserOrderQueryParams,
  UserOrdersResponse,
  User,
} from "./user-types";

// ============================================================
// CURRENT USER
// ============================================================

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiClient<CurrentUserResponse>("/api/users/me");
}

// ============================================================
// UPDATE CURRENT USER
// ============================================================

export type UpdateCurrentUserInput = {
  firstName?: string;

  lastName?: string;

  phone?: string;
};

export async function updateCurrentUser(
  data: UpdateCurrentUserInput
): Promise<CurrentUserResponse> {
  return apiClient<CurrentUserResponse>("/api/users/me", {
    method: "PATCH",

    body: JSON.stringify(data),
  });
}

// ============================================================
// ADMIN USER LIST
// ============================================================

export async function getAdminUsers(
  params: AdminUserQueryParams = {}
): Promise<AdminUsersResponse> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  if (params.role && params.role !== "all") {
    searchParams.set("role", params.role);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  const query = searchParams.toString();

  const url = query ? `/api/admin/users?${query}` : "/api/admin/users";

  return apiClient<AdminUsersResponse>(url);
}

// ============================================================
// ADMIN USER DETAILS
// ============================================================

export async function getAdminUser(
  id: string
): Promise<AdminUserDetailsResponse> {
  return apiClient<AdminUserDetailsResponse>(`/api/admin/users/${id}`);
}

// ============================================================
// UPDATE ADMIN USER
// ============================================================

export async function updateAdminUser(
  id: string,
  data: UpdateAdminUserInput
): Promise<{
  success: true;
  data: User;
}> {
  return apiClient<{
    success: true;
    data: User;
  }>(`/api/admin/users/${id}`, {
    method: "PATCH",

    body: JSON.stringify(data),
  });
}

// ============================================================
// ADMIN USER ORDERS
// ============================================================

export async function getAdminUserOrders(
  id: string,
  params: UserOrderQueryParams = {}
): Promise<UserOrdersResponse> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();

  const url = query
    ? `/api/admin/users/${id}/orders?${query}`
    : `/api/admin/users/${id}/orders`;

  return apiClient<UserOrdersResponse>(url);
}
