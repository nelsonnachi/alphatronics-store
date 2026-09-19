import { apiClient } from "@/lib/api/client";

import type {
  AdminInventoryQueryParams,
  AdminInventoryResponse,
  AdminProductInventoryResponse,
  AdminInventoryMovementQueryParams,
  AdminInventoryMovementResponse,
  UpdateInventoryInput,
  UpdatedInventory,
  UpdatedVariantInventory,
} from "./admin-inventory-types";

// ============================================================
// HELPER
// ============================================================

function buildQueryString(
  params: Record<string, unknown>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

// ============================================================
// GET ADMIN INVENTORY
// ============================================================

export async function getAdminInventory(
  params: AdminInventoryQueryParams = {},
) {
  const queryString = buildQueryString(params);

  const response = await apiClient<{
    success: true;
    data: AdminInventoryResponse;
  }>(
    `/api/admin/inventory${queryString}`,
  );

  return response.data;
}

// ============================================================
// GET SINGLE PRODUCT INVENTORY
// ============================================================

export async function getAdminProductInventory(
  productId: string,
) {
  const response = await apiClient<{
    success: true;
    data: AdminProductInventoryResponse;
  }>(
    `/api/admin/inventory/${productId}`,
  );

  return response.data;
}

// ============================================================
// UPDATE PRODUCT INVENTORY
// ============================================================

export async function updateProductInventory(
  productId: string,
  data: UpdateInventoryInput,
) {
  const response = await apiClient<{
    success: true;
    data: UpdatedInventory & {
      movement: unknown;
    };
    message: string;
  }>(
    `/api/admin/inventory/${productId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  return response.data;
}

// ============================================================
// UPDATE VARIANT INVENTORY
// ============================================================

export async function updateVariantInventory(
  productId: string,
  variantId: string,
  data: UpdateInventoryInput,
) {
  const response = await apiClient<{
    success: true;
    data: UpdatedVariantInventory;
    message: string;
  }>(
    `/api/admin/inventory/${productId}/variants/${variantId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  return response.data;
}

// ============================================================
// GET INVENTORY MOVEMENTS
// ============================================================

export async function getAdminInventoryMovements(
  params: AdminInventoryMovementQueryParams = {},
) {
  const queryString = buildQueryString(params);

  const response = await apiClient<{
    success: true;
    data: AdminInventoryMovementResponse;
  }>(
    `/api/admin/inventory/movements${queryString}`,
  );

  return response.data;
}