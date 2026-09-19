// ============================================================
// INVENTORY TYPES
// ============================================================

export type StockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock";

export type InventoryItemType =
  | "product"
  | "variant";

// ============================================================
// INVENTORY LIST ITEM
// ============================================================

export type AdminInventoryItem = {
  productId: string;
  productName: string;
  productSku: string;

  type: InventoryItemType;

  variantId?: string;
  variantName?: string;
  variantSku?: string;

  stock: number;
  reservedStock: number;
  availableStock: number;

  lowStockThreshold: number;
  stockStatus: StockStatus;

  createdAt: string;
  updatedAt: string;
};

// ============================================================
// INVENTORY SUMMARY
// ============================================================

export type AdminInventorySummary = {
  totalProducts: number;
  totalVariants: number;
  totalInventoryItems: number;

  physicalStock: number;
  reservedStock: number;
  availableStock: number;

  lowStockItems: number;
  outOfStockItems: number;
};

// ============================================================
// PAGINATION
// ============================================================

export type InventoryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// ============================================================
// GET INVENTORY RESPONSE
// ============================================================

export type AdminInventoryResponse = {
  summary: AdminInventorySummary;

  inventory: AdminInventoryItem[];

  pagination: InventoryPagination;
};

// ============================================================
// INVENTORY QUERY PARAMETERS
// ============================================================

export type AdminInventoryQueryParams = {
  page?: number;
  limit?: number;

  search?: string;

  status?: StockStatus;

  minStock?: number;
  maxStock?: number;

  type?: InventoryItemType;

  sort?:
    | "stock_asc"
    | "stock_desc"
    | "name_asc"
    | "name_desc"
    | "newest"
    | "oldest";
};

// ============================================================
// UPDATE INVENTORY
// ============================================================

export type UpdateInventoryInput = {
  stock?: number;
  reservedStock?: number;
  lowStockThreshold?: number;
};

// ============================================================
// SINGLE PRODUCT INVENTORY
// ============================================================

export type AdminInventoryVariant = {
  id: string;
  name: string;
  sku: string;

  stock: number;
  reservedStock: number;
  availableStock: number;

  lowStockThreshold: number;
  stockStatus: StockStatus;

  imageUrl: string | null;
  attributes: Record<string, string>;

  isActive: boolean;
};

export type AdminInventoryProduct = {
  id: string;
  name: string;
  sku: string;
  isActive: boolean;

  inventoryType: "product" | "variant";
};

export type AdminProductInventorySummary = {
  physicalStock: number;
  reservedStock: number;
  availableStock: number;

  lowStockItems?: number;
  outOfStockItems?: number;

  lowStockThreshold?: number;
  stockStatus?: StockStatus;

  totalVariants: number;
};

export type AdminProductInventoryResponse = {
  product: AdminInventoryProduct;

  inventory: AdminProductInventorySummary;

  variants: AdminInventoryVariant[];
};

// ============================================================
// INVENTORY UPDATE RESPONSE
// ============================================================

export type UpdatedInventory = {
  id: string;
  name: string;
  sku: string;

  stock: number;
  reservedStock: number;

  lowStockThreshold: number;

  stockStatus: StockStatus;

  updatedAt: string;

  availableStock: number;
};

// ============================================================
// VARIANT INVENTORY UPDATE RESPONSE
// ============================================================

export type UpdatedVariantInventory = {
  id: string;
  productId: string;

  name: string;
  sku: string;

  stock: number;
  reservedStock: number;

  isActive: boolean;

  createdAt: string;

  availableStock: number;

  lowStockThreshold: number;

  stockStatus: StockStatus;
};

// ============================================================
// INVENTORY MOVEMENTS
// ============================================================

export type InventoryMovementType =
  | "purchase"
  | "adjustment"
  | "sale"
  | "return"
  | "release"
  | "damage"
  | "restock";

export type InventoryMovementDirection =
  | "increase"
  | "decrease";

export type AdminInventoryMovement = {
  id: string;

  productId: string;
  variantId: string | null;

  userId: string | null;
  orderId: string | null;

  type: InventoryMovementType;

  quantity: number;

  stockBefore: number;
  stockAfter: number;

  reservedStockBefore: number;
  reservedStockAfter: number;

  reason: string | null;

  metadata: Record<string, unknown> | null;

  createdAt: string;

  product: {
    id: string;
    name: string;
    sku: string;
  } | null;

  variant: {
    id: string;
    name: string;
    sku: string;
  } | null;

  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;

  order: {
    id: string;
    orderNumber: string;
  } | null;
};

export type InventoryMovementSummary = {
  totalMovements: number;
  totalIncreased: number;
  totalDecreased: number;
  netQuantityChange: number;
};

export type AdminInventoryMovementResponse = {
  movements: AdminInventoryMovement[];

  summary: InventoryMovementSummary;

  pagination: InventoryPagination;
};

export type AdminInventoryMovementQueryParams = {
  page?: number;
  limit?: number;

  search?: string;

  productId?: string;
  variantId?: string;

  type?: InventoryMovementType;

  direction?: InventoryMovementDirection;

  from?: string;
  to?: string;

  sort?: "newest" | "oldest";
};