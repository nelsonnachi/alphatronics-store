"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminUser,
  getAdminUserOrders,
  getAdminUsers,
  getCurrentUser,
  updateAdminUser,
  updateCurrentUser,
} from "./user-api";

import { userKeys } from "./user-keys";

import type {
  AdminUserQueryParams,
  UpdateAdminUserInput,
  UserOrderQueryParams,
} from "./user-types";

import type { UpdateCurrentUserInput } from "./user-api";

// ============================================================
// CURRENT USER
// ============================================================

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current(),

    queryFn: getCurrentUser,

    staleTime: 5 * 60 * 1000,

    retry: 1,
  });
}

// ============================================================
// UPDATE CURRENT USER
// ============================================================

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCurrentUserInput) => updateCurrentUser(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.current(),
      });
    },
  });
}

// ============================================================
// ADMIN USER LIST
// ============================================================

export function useAdminUsers(params: AdminUserQueryParams = {}) {
  return useQuery({
    queryKey: userKeys.adminList(params),

    queryFn: () => getAdminUsers(params),

    placeholderData: (previousData) => previousData,

    staleTime: 30 * 1000,

    retry: 1,
  });
}

// ============================================================
// ADMIN USER DETAILS
// ============================================================

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: userKeys.adminDetail(id),

    queryFn: () => getAdminUser(id),

    enabled: Boolean(id),

    staleTime: 30 * 1000,

    retry: 1,
  });
}

// ============================================================
// ADMIN USER ORDERS
// ============================================================

export function useAdminUserOrders(
  id: string,
  params: UserOrderQueryParams = {}
) {
  return useQuery({
    queryKey: userKeys.adminOrders(id, params),

    queryFn: () => getAdminUserOrders(id, params),

    enabled: Boolean(id),

    placeholderData: (previousData) => previousData,

    staleTime: 30 * 1000,

    retry: 1,
  });
}

// ============================================================
// UPDATE ADMIN USER
// ============================================================

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;

      data: UpdateAdminUserInput;
    }) => updateAdminUser(id, data),

    onSuccess: (_response, variables) => {
      // Refresh every admin-user list.
      queryClient.invalidateQueries({
        queryKey: userKeys.admin(),
      });

      // Refresh the specific customer page.
      queryClient.invalidateQueries({
        queryKey: userKeys.adminDetail(variables.id),
      });

      // Keep current-user information
      // fresh if necessary.
      queryClient.invalidateQueries({
        queryKey: userKeys.current(),
      });
    },
  });
}
