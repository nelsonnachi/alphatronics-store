// ============================================================
// SHOP VIEW
// ============================================================

export type ShopView = "grid" | "list";

// ============================================================
// SHOP SORT
// ============================================================

export type ShopSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popularity"
  | "name_asc";

// ============================================================
// SHOP FILTERS
// ============================================================

export type ShopFiltersState = {
  categories: string[];
  brands: string[];

  minPrice: string;
  maxPrice: string;

  minRating: number | null;

  inStock: boolean;
  onSale: boolean;
};

// ============================================================
// DEFAULT FILTERS
// ============================================================

export const defaultShopFilters: ShopFiltersState = {
  categories: [],
  brands: [],

  minPrice: "",
  maxPrice: "",

  minRating: null,

  inStock: false,
  onSale: false,
};