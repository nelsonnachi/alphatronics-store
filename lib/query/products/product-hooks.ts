import { useQuery } from "@tanstack/react-query";

import {
  getProducts,
  getProduct,
  getRelatedProducts,
} from "./product-api";

import { productKeys } from "./product-keys";

import type {
  ProductQueryParams,
} from "./product-types";

// ============================================================
// GET PRODUCTS
// ============================================================

export function useProducts(
  params?: ProductQueryParams,
) {
  return useQuery({
    queryKey: productKeys.list(params ?? {}),

    queryFn: () => getProducts(params),
  });
}

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

export function useProduct(
  slug: string,
) {
  return useQuery({
    queryKey: productKeys.detail(slug),

    queryFn: () => getProduct(slug),

    enabled: Boolean(slug),
  });
}

// ============================================================
// GET RELATED PRODUCTS
// ============================================================

export function useRelatedProducts(
  slug: string,
) {
  return useQuery({
    queryKey: productKeys.relatedList(slug),

    queryFn: () => getRelatedProducts(slug),

    enabled: Boolean(slug),
  });
}