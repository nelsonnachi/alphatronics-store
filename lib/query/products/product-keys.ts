import type { ProductQueryParams } from "./product-types";
import type { AdminProductQueryParams } from "./admin/admin-product-types";

export const productKeys = {
  // ============================================================
  // ALL PRODUCTS
  // ============================================================

  all: ["products"] as const,

  // ============================================================
  // PUBLIC PRODUCT LIST
  // ============================================================

  lists: () => [...productKeys.all, "list"] as const,

  list: (filters: ProductQueryParams) =>
    [...productKeys.lists(), filters] as const,

  // ============================================================
  // PUBLIC PRODUCT DETAILS
  // ============================================================

  details: () => [...productKeys.all, "detail"] as const,

  detail: (slug: string) =>
    [...productKeys.details(), slug] as const,

  // ============================================================
  // RELATED PRODUCTS
  // ============================================================

  related: () => [...productKeys.all, "related"] as const,

  relatedList: (slug: string) =>
    [...productKeys.related(), slug] as const,

  // ============================================================
  // ADMIN PRODUCTS
  // ============================================================

  adminAll: ["admin-products"] as const,

  adminLists: () =>
    [...productKeys.adminAll, "list"] as const,

  adminList: (params: AdminProductQueryParams) =>
    [...productKeys.adminLists(), params] as const,

  // ============================================================
  // ADMIN PRODUCT DETAILS
  // ============================================================

  adminDetails: () =>
    [...productKeys.adminAll, "detail"] as const,

  adminDetail: (slug: string) =>
    [...productKeys.adminDetails(), slug] as const,
};