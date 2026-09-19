import { useQuery } from "@tanstack/react-query";

import {
  getBrands,
  getBrand,
} from "./brand-api";

import { brandKeys } from "./brand-keys";

// ============================================================
// GET ALL BRANDS
// ============================================================

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.list(),

    queryFn: getBrands,
  });
}

// ============================================================
// GET SINGLE BRAND
// ============================================================

export function useBrand(
  slug: string,
) {
  return useQuery({
    queryKey: brandKeys.detail(slug),

    queryFn: () =>
      getBrand(slug),

    enabled: Boolean(slug),
  });
}