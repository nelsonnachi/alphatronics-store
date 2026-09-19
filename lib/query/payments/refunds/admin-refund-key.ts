// ============================================================
// ADMIN REFUND QUERY KEYS
// ============================================================

export const adminRefundKeys = {
  // Everything related to admin refunds
  all: ["admin-refunds"] as const,

  // All refund lists
  lists: () =>
    [
      ...adminRefundKeys.all,
      "list",
    ] as const,

  // Refunds belonging to one order
  byOrder: (orderId: string) =>
    [
      ...adminRefundKeys.lists(),
      "order",
      orderId,
    ] as const,

  // All individual refund details
  details: () =>
    [
      ...adminRefundKeys.all,
      "detail",
    ] as const,

  // One specific refund
  detail: (refundId: string) =>
    [
      ...adminRefundKeys.details(),
      refundId,
    ] as const,
};