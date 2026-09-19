import { apiClient } from "@/lib/api/client";

import type {
  CategoriesResponse,
  CategoryResponse,
  CategoryQueryParams,
  CategoryTreeResponse,
} from "./category-types";

// ============================================================
// GET PUBLIC CATEGORIES
// ============================================================

export async function getCategories(
  params: CategoryQueryParams = {},
): Promise<CategoriesResponse> {
  const searchParams = new URLSearchParams();

  if (params.featured !== undefined) {
    searchParams.set(
      "featured",
      String(params.featured),
    );
  }

  if (params.tree !== undefined) {
    searchParams.set(
      "tree",
      String(params.tree),
    );
  }

  const queryString = searchParams.toString();

  const url = queryString
    ? `/api/categories?${queryString}`
    : "/api/categories";

  return apiClient<CategoriesResponse>(url);
}

// ============================================================
// GET CATEGORY TREE
// ============================================================

export async function getCategoryTree(): Promise<CategoryTreeResponse> {
  return apiClient<CategoryTreeResponse>(
    "/api/categories?tree=true",
  );
}

// ============================================================
// GET SINGLE CATEGORY
// ============================================================

export async function getCategory(
  slug: string,
): Promise<CategoryResponse> {
  return apiClient<CategoryResponse>(
    `/api/categories/${slug}`,
  );
}