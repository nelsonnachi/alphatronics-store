// ============================================================
// ADMIN INVENTORY QUERY KEYS
// ============================================================

export const adminInventoryKeys = {
  // Everything related to admin inventory
  all: ["admin-inventory"] as const,

  // Inventory list
  lists: () => [...adminInventoryKeys.all, "list"] as const,

  list: (params: Record<string, unknown>) =>
    [...adminInventoryKeys.lists(), params] as const,

  // Single product inventory
  details: () => [...adminInventoryKeys.all, "detail"] as const,

  detail: (productId: string) =>
    [...adminInventoryKeys.details(), productId] as const,

  // Inventory movements
  movements: () =>
    [...adminInventoryKeys.all, "movements"] as const,

  movementList: (params: Record<string, unknown>) =>
    [...adminInventoryKeys.movements(), params] as const,
};