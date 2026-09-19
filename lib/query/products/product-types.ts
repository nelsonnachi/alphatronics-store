// ============================================================
// CATEGORY
// ============================================================

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

// ============================================================
// BRAND
// ============================================================

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
}

// ============================================================
// PRODUCT IMAGE
// ============================================================

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
  createdAt: string;
}

// ============================================================
// PRODUCT SPECIFICATION
// ============================================================

export interface ProductSpecification {
  id: string;
  productId: string;
  group: string;
  key: string;
  value: string;
  position: number;
}

// ============================================================
// PRODUCT VARIANT
// ============================================================

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: string | null;
  compareAtPrice: string | null;
  stock: number;
  reservedStock: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  attributes: Record<string, string>;
  isActive: boolean;
  createdAt: string;
}

// ============================================================
// PRODUCT
// ============================================================

export interface Product {
  id: string;

  name: string;
  slug: string;
  sku: string;

  description: string;
  shortDescription: string | null;

  categoryId: string;
  brandId: string | null;

  price: string;
  compareAtPrice: string | null;
  costPrice: string | null;

  currency: string;

  stock: number;
  reservedStock: number;
  lowStockThreshold: number;

  stockStatus:
    | "in_stock"
    | "low_stock"
    | "out_of_stock"
    | "preorder"
    | "discontinued";

  warrantyMonths: number;
  weightKg: string | null;

  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;

  avgRating: string;
  reviewCount: number;
  soldCount: number;

  metaTitle: string | null;
  metaDescription: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  category: ProductCategory | null;
  brand: ProductBrand | null;

  images: ProductImage[];
}

// ============================================================
// PRODUCT DETAILS
// ============================================================

export interface ProductDetails extends Product {
  specifications: ProductSpecification[];
  variants: ProductVariant[];
}

// ============================================================
// RELATED PRODUCT
// ============================================================

export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;

  price: string;
  compareAtPrice: string | null;
  currency: string;

  stock: number;

  stockStatus:
    | "in_stock"
    | "low_stock"
    | "out_of_stock"
    | "preorder"
    | "discontinued";

  avgRating: string;
  reviewCount: number;

  isBestSeller: boolean;
  isNewArrival: boolean;

  category: ProductCategory;
  brand: ProductBrand | null;

  images: ProductImage[];
}

// ============================================================
// PAGINATION
// ============================================================

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================
// PRODUCTS LIST RESPONSE
// ============================================================

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: ProductPagination;
}

// ============================================================
// PRODUCT DETAILS RESPONSE
// ============================================================

export interface ProductDetailsResponse {
  success: boolean;
  data: ProductDetails;
}

// ============================================================
// RELATED PRODUCTS RESPONSE
// ============================================================

export interface RelatedProductsResponse {
  success: boolean;
  data: RelatedProduct[];
}

// ============================================================
// PUBLIC PRODUCT QUERY PARAMETERS
// ============================================================

export interface ProductQueryParams {
  page?: number;
  limit?: number;

  search?: string;

  category?: string;
  brand?: string;

  minPrice?: number;
  maxPrice?: number;

  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  inStock?: boolean;

  minRating?: number;

  sort?:
    | "newest"
    | "price_asc"
    | "price_desc"
    | "rating"
    | "popularity"
    | "name_asc";
}