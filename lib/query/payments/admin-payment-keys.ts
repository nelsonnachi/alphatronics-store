// lib/payments/admin-payment-keys.ts

export const adminPaymentKeys = {
  // Base key for everything related to admin payments
  all: ["admin-payments"] as const,

  // All payment lists
  lists: () =>
    [
      ...adminPaymentKeys.all,
      "list",
    ] as const,

  // A specific payment list/filter combination
  list: (
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    },
  ) =>
    [
      ...adminPaymentKeys.lists(),
      filters,
    ] as const,

  // All individual payment details
  details: () =>
    [
      ...adminPaymentKeys.all,
      "detail",
    ] as const,

  // One specific payment
  detail: (paymentId: string) =>
    [
      ...adminPaymentKeys.details(),
      paymentId,
    ] as const,
};