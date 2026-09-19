import { apiClient } from "@/lib/api/client";

import type {
  AdminBrandsResponse,
  CreateBrandResponse,
  UpdateBrandResponse,
  DeleteBrandResponse,
  CreateBrandInput,
  UpdateBrandInput,
} from "./admin-brand-types";

// ============================================================
// GET ADMIN BRANDS
// ============================================================

export async function getAdminBrands(): Promise<AdminBrandsResponse> {
  return apiClient<AdminBrandsResponse>(
    "/api/admin/brands",
  );
}

// ============================================================
// CREATE BRAND
// ============================================================

export async function createBrand(
  data: CreateBrandInput,
): Promise<CreateBrandResponse> {
  return apiClient<CreateBrandResponse>(
    "/api/admin/brands",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// ============================================================
// UPDATE BRAND
// ============================================================

export async function updateBrand(
  slug: string,
  data: UpdateBrandInput,
): Promise<UpdateBrandResponse> {
  return apiClient<UpdateBrandResponse>(
    `/api/admin/brands/${slug}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

// ============================================================
// DELETE / DEACTIVATE BRAND
// ============================================================

export async function deleteBrand(
  slug: string,
): Promise<DeleteBrandResponse> {
  return apiClient<DeleteBrandResponse>(
    `/api/admin/brands/${slug}`,
    {
      method: "DELETE",
    },
  );
}