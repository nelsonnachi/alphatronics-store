import type {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
} from "../brand-types";

// ============================================================
// ADMIN BRANDS RESPONSE
// ============================================================

export interface AdminBrandsResponse {
  success: boolean;

  data: Brand[];
}

// ============================================================
// CREATE BRAND RESPONSE
// ============================================================

export interface CreateBrandResponse {
  success: boolean;

  data: Brand;
}

// ============================================================
// UPDATE BRAND RESPONSE
// ============================================================

export interface UpdateBrandResponse {
  success: boolean;

  data: Brand;
}

// ============================================================
// DELETE BRAND RESPONSE
// ============================================================

export interface DeleteBrandResponse {
  success: boolean;

  data: {
    message: string;
  };
}

// ============================================================
// RE-EXPORT INPUT TYPES
// ============================================================

export type {
  CreateBrandInput,
  UpdateBrandInput,
};