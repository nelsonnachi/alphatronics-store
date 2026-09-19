import type {
  Product,
  ProductDetails,
  ProductPagination,
} from "../product-types";

// ============================================================
// ADMIN PRODUCT QUERY PARAMETERS
// ============================================================

export interface AdminProductQueryParams {
  page?: number;
  limit?: number;

  search?: string;

  status?: "all" | "active" | "inactive";

  sort?:
    | "newest"
    | "oldest"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "stock_asc"
    | "stock_desc";

  category?: string;
  brand?: string;

  minPrice?: number;
  maxPrice?: number;

  inStock?: boolean;
  lowStock?: boolean;

  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
}

// ============================================================
// ADMIN PRODUCTS LIST RESPONSE
// ============================================================

export interface AdminProductsResponse {
  success: boolean;

  data: Product[];

  pagination: ProductPagination;

  message?: string;
}

// ============================================================
// ADMIN SINGLE PRODUCT RESPONSE
// ============================================================

export interface AdminProductResponse {
  success: boolean;

  data: ProductDetails;

  message?: string;
}

// ============================================================
// CREATE PRODUCT RESPONSE
// ============================================================

export interface CreateProductResponse {
  success: boolean;

  data: Product;

  message: string;
}

// ============================================================
// UPDATE PRODUCT RESPONSE
// ============================================================

export interface UpdateProductResponse {
  success: boolean;

  data: Product;

  message: string;
}

// ============================================================
// DELETE PRODUCT RESPONSE
// ============================================================

export interface DeleteProductResponse {
  success: boolean;

  data: {
    message: string;
  };

  message?: string;
}