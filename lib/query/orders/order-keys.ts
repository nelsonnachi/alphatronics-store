import type {
  AdminOrderQueryParams,
} from "./order-types";

export const orderKeys = {
  // ============================================================
  // ADMIN ORDERS
  // ============================================================

  adminAll: ["admin-orders"] as const,

  adminLists: () =>
    [
      ...orderKeys.adminAll,
      "list",
    ] as const,

  adminList: (
    params: AdminOrderQueryParams,
  ) =>
    [
      ...orderKeys.adminLists(),
      params,
    ] as const,

  // ============================================================
  // ADMIN ORDER DETAILS
  // ============================================================

  adminDetails: () =>
    [
      ...orderKeys.adminAll,
      "detail",
    ] as const,

  adminDetail: (
    id: string,
  ) =>
    [
      ...orderKeys.adminDetails(),
      id,
    ] as const,
};