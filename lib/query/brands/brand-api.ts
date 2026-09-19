import { apiClient } from "@/lib/api/client";

import type {
  BrandsResponse,
  BrandResponse,
} from "./brand-types";

// ============================================================
// GET PUBLIC BRANDS
// ============================================================

export async function getBrands(): Promise<BrandsResponse> {
  return apiClient<BrandsResponse>(
    "/api/brands",
  );
}

// ============================================================
// GET SINGLE PUBLIC BRAND
// ============================================================

export async function getBrand(
  slug: string,
): Promise<BrandResponse> {
  return apiClient<BrandResponse>(
    `/api/brands/${slug}`,
  );
}