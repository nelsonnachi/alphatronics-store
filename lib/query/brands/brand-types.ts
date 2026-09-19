// ============================================================
// BRAND
// ============================================================

export interface Brand {
  id: string;

  name: string;

  slug: string;

  logoUrl: string | null;

  description: string | null;

  website: string | null;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// PUBLIC BRANDS RESPONSE
// ============================================================

export interface BrandsResponse {
  success: boolean;

  data: Brand[];
}

// ============================================================
// PUBLIC SINGLE BRAND RESPONSE
// ============================================================

export interface BrandResponse {
  success: boolean;

  data: Brand;
}

// ============================================================
// CREATE BRAND INPUT
// ============================================================

export interface CreateBrandInput {
  name: string;

  slug: string;

  logoUrl?: string;

  description?: string;

  website?: string;
}

// ============================================================
// UPDATE BRAND INPUT
// ============================================================

export interface UpdateBrandInput {
  name?: string;

  slug?: string;

  logoUrl?: string;

  description?: string;

  website?: string;

  isActive?: boolean;
}