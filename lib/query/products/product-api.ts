import { apiClient } from "@/lib/api/client";

import type {
  ProductDetailsResponse,
  ProductsResponse,
  ProductQueryParams,
  RelatedProductsResponse,
} from "./product-types";

// ============================================================
// GET PRODUCTS
// ============================================================

export async function getProducts(
  params?: ProductQueryParams,
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();

  // ==========================================================
  // PAGINATION
  // ==========================================================

  if (params?.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  // ==========================================================
  // CATEGORY
  // ==========================================================

  if (params?.category) {
    searchParams.set("category", params.category);
  }

  // ==========================================================
  // BRAND
  // ==========================================================

  if (params?.brand) {
    searchParams.set("brand", params.brand);
  }

  // ==========================================================
  // PRICE
  // ==========================================================

  if (params?.minPrice !== undefined) {
    searchParams.set("minPrice", String(params.minPrice));
  }

  if (params?.maxPrice !== undefined) {
    searchParams.set("maxPrice", String(params.maxPrice));
  }

  // ==========================================================
  // PRODUCT FLAGS
  // ==========================================================

  if (params?.featured !== undefined) {
    searchParams.set("featured", String(params.featured));
  }

  if (params?.newArrival !== undefined) {
    searchParams.set("newArrival", String(params.newArrival));
  }

  if (params?.bestSeller !== undefined) {
    searchParams.set("bestSeller", String(params.bestSeller));
  }

  // ==========================================================
  // STOCK
  // ==========================================================

  if (params?.inStock !== undefined) {
    searchParams.set("inStock", String(params.inStock));
  }

  // ==========================================================
  // RATING
  // ==========================================================

  if (params?.minRating !== undefined) {
    searchParams.set("minRating", String(params.minRating));
  }

  // ==========================================================
  // SORT
  // ==========================================================

  if (params?.sort) {
    searchParams.set("sort", params.sort);
  }

  // ==========================================================
  // FINAL URL
  // ==========================================================

  const queryString = searchParams.toString();

  const url = queryString
    ? `/api/products?${queryString}`
    : "/api/products";

  return apiClient<ProductsResponse>(url);
}

// ============================================================
// GET PRODUCT DETAILS
// ============================================================

export async function getProduct(
  slug: string,
): Promise<ProductDetailsResponse> {
  return apiClient<ProductDetailsResponse>(
    `/api/products/${slug}`,
  );
}

// ============================================================
// GET RELATED PRODUCTS
// ============================================================

export async function getRelatedProducts(
  slug: string,
): Promise<RelatedProductsResponse> {
  return apiClient<RelatedProductsResponse>(
    `/api/products/${slug}/related`,
  );
}