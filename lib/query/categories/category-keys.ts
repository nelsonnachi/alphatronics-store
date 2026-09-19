import type { CategoryQueryParams } from "./category-types";

export const categoryKeys = {
  // ============================================================
  // PUBLIC / CUSTOMER
  // ============================================================

  all: ["categories"] as const,

  lists: () =>
    [...categoryKeys.all, "list"] as const,

  list: (params: CategoryQueryParams = {}) =>
    [...categoryKeys.lists(), params] as const,

  details: () =>
    [...categoryKeys.all, "detail"] as const,

  detail: (slug: string) =>
    [...categoryKeys.details(), slug] as const,

  tree: () =>
    [...categoryKeys.all, "tree"] as const,

  // ============================================================
  // ADMIN
  // ============================================================

  adminAll: ["admin-categories"] as const,

  adminLists: () =>
    [...categoryKeys.adminAll, "list"] as const,

  adminList: () =>
    [...categoryKeys.adminLists()] as const,
};