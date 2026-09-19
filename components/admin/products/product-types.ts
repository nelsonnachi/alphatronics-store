// components/admin/products/product-types.ts

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
  createdAt: string;
};

export type ProductSpecification = {
  id: string;
  productId: string;
  group: string;
  key: string;
  value: string;
  position: number;
};

export type ProductVariant = {
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
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductBrand = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProduct = {
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
  specifications: ProductSpecification[];
  variants: ProductVariant[];
};

export type AdminProductsResponse = {
  success: boolean;

  data: AdminProduct[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};