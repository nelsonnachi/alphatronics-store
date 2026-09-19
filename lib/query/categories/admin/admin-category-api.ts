import { apiClient } from "@/lib/api/client";

import type {
  AdminCategoriesResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./admin-category-types";

// ============================================================
// GET ADMIN CATEGORIES
// ============================================================

export async function getAdminCategories(): Promise<AdminCategoriesResponse> {
  return apiClient<AdminCategoriesResponse>(
    "/api/admin/categories",
  );
}

// ============================================================
// CREATE CATEGORY
// ============================================================

export async function createCategory(
  data: CreateCategoryInput,
): Promise<CreateCategoryResponse> {
  return apiClient<CreateCategoryResponse>(
    "/api/admin/categories",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// ============================================================
// UPDATE CATEGORY
// ============================================================

export async function updateCategory(
  slug: string,
  data: UpdateCategoryInput,
): Promise<UpdateCategoryResponse> {
  return apiClient<UpdateCategoryResponse>(
    `/api/admin/categories/${slug}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

// ============================================================
// DELETE CATEGORY
// ============================================================

export async function deleteCategory(
  slug: string,
): Promise<DeleteCategoryResponse> {
  return apiClient<DeleteCategoryResponse>(
    `/api/admin/categories/${slug}`,
    {
      method: "DELETE",
    },
  );
}