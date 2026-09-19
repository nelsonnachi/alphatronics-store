export const brandKeys = {
  // ============================================================
  // PUBLIC / CUSTOMER
  // ============================================================

  all: ["brands"] as const,

  lists: () =>
    [...brandKeys.all, "list"] as const,

  list: () =>
    [...brandKeys.lists()] as const,

  details: () =>
    [...brandKeys.all, "detail"] as const,

  detail: (slug: string) =>
    [...brandKeys.details(), slug] as const,

  // ============================================================
  // ADMIN
  // ============================================================

  adminAll: ["admin-brands"] as const,

  adminLists: () =>
    [...brandKeys.adminAll, "list"] as const,

  adminList: () =>
    [...brandKeys.adminLists()] as const,
};