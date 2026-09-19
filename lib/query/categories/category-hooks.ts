import { useQuery } from "@tanstack/react-query";

import {
  getCategories,
  getCategory,
  getCategoryTree,
} from "./category-api";

import { categoryKeys } from "./category-keys";

import type {
  CategoryQueryParams,
} from "./category-types";

// ============================================================
// GET PUBLIC CATEGORIES
// ============================================================

export function useCategories(
  params: CategoryQueryParams = {},
) {
  return useQuery({
    queryKey: categoryKeys.list(params),

    queryFn: () =>
      getCategories(params),
  });
}

// ============================================================
// GET FEATURED CATEGORIES
// ============================================================

export function useFeaturedCategories() {
  return useQuery({
    queryKey: categoryKeys.list({
      featured: true,
    }),

    queryFn: () =>
      getCategories({
        featured: true,
      }),
  });
}

// ============================================================
// GET CATEGORY TREE
// ============================================================

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),

    queryFn: getCategoryTree,
  });
}

// ============================================================
// GET SINGLE CATEGORY
// ============================================================

export function useCategory(
  slug: string,
) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),

    queryFn: () =>
      getCategory(slug),

    enabled: Boolean(slug),
  });
}