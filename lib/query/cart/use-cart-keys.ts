// ============================================================
// CART QUERY KEYS
// ============================================================
//
// TanStack Query uses these keys to identify cart data
// inside its cache.
//
// We only have one current cart for the visitor,
// so we don't need pagination or filters here.
// ============================================================

export const cartKeys = {
  // Base key for everything related to the cart.
  all: ["cart"] as const,

  // Key for the current cart.
  current: () =>
    [
      ...cartKeys.all,
      "current",
    ] as const,
};