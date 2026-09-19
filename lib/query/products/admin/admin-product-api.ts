import { apiClient } from "@/lib/api/client";

import type {
  AdminProductQueryParams,
  AdminProductsResponse,
  AdminProductResponse,
  CreateProductResponse,
  UpdateProductResponse,
  DeleteProductResponse,
} from "./admin-product-types";

// ============================================================
// GET ADMIN PRODUCTS
// ============================================================

export async function getAdminProducts(
  params: AdminProductQueryParams = {},
): Promise<AdminProductsResponse> {
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

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.brand) {
    searchParams.set("brand", params.brand);
  }

  if (params.minPrice !== undefined) {
    searchParams.set("minPrice", String(params.minPrice));
  }

  if (params.maxPrice !== undefined) {
    searchParams.set("maxPrice", String(params.maxPrice));
  }

  if (params.inStock !== undefined) {
    searchParams.set("inStock", String(params.inStock));
  }

  if (params.lowStock !== undefined) {
    searchParams.set("lowStock", String(params.lowStock));
  }

  if (params.featured !== undefined) {
    searchParams.set("featured", String(params.featured));
  }

  if (params.newArrival !== undefined) {
    searchParams.set("newArrival", String(params.newArrival));
  }

  if (params.bestSeller !== undefined) {
    searchParams.set("bestSeller", String(params.bestSeller));
  }

  const queryString = searchParams.toString();

  const url = queryString
    ? `/api/admin/products?${queryString}`
    : "/api/admin/products";

  return apiClient<AdminProductsResponse>(url);
}

// ============================================================
// GET SINGLE ADMIN PRODUCT
// ============================================================

export async function getAdminProduct(
  slug: string,
): Promise<AdminProductResponse> {
  return apiClient<AdminProductResponse>(
    `/api/admin/products/${slug}`,
  );
}

// ============================================================
// CREATE PRODUCT
// ============================================================

export async function createProduct(
  formData: FormData,
): Promise<CreateProductResponse> {
  return apiClient<CreateProductResponse>(
    "/api/admin/products",
    {
      method: "POST",
      body: formData,
    },
  );
}

// ============================================================
// UPDATE PRODUCT
// ============================================================

export async function updateProduct(
  slug: string,
  formData: FormData,
): Promise<UpdateProductResponse> {
  return apiClient<UpdateProductResponse>(
    `/api/admin/products/${slug}`,
    {
      method: "PATCH",
      body: formData,
    },
  );
}

// ============================================================
// DELETE PRODUCT
// ============================================================

export async function deleteProduct(
  slug: string,
): Promise<DeleteProductResponse> {
  return apiClient<DeleteProductResponse>(
    `/api/admin/products/${slug}`,
    {
      method: "DELETE",
    },
  );
}