// ============================================================
// CART TYPES
// ============================================================

// ============================================================
// CART IMAGE
// ============================================================

export type CartProductImage = {
  id: string;
  url: string;
  publicId: string;
  position: number;
  isPrimary: boolean;
};

// ============================================================
// CART PRODUCT
// ============================================================

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  stock: number;
  isActive: boolean;

  images: CartProductImage[];
};

// ============================================================
// CART VARIANT
// ============================================================

export type CartVariant = {
  id: string;
  productId: string;
  sku: string;
  name: string | null;
  price: string | null;
  stock: number;
  isActive: boolean;

  // Your database stores variant attributes
  // as JSON.
  attributes: Record<string, string>;
};

// ============================================================
// CART ITEM
// ============================================================

export type CartItem = {
  id: string;

  cartId: string;

  productId: string;

  variantId: string | null;

  quantity: number;

  // Price when the item was originally
  // added to the cart.
  //
  // We keep this because it exists in
  // the database, but we DO NOT use it
  // for the current cart total.
  priceAtAdd: string;

  createdAt: string;

  updatedAt: string;

  product: CartProduct;

  variant: CartVariant | null;
};

// ============================================================
// CART
// ============================================================

export type Cart = {
  id: string | null;

  userId?: string | null;

  sessionId?: string | null;

  items: CartItem[];

  createdAt?: string;

  updatedAt?: string;

  // Calculated by computeCartTotals()
  subtotal: number;

  // Total quantity of all cart items.
  //
  // Example:
  //
  // Product A = quantity 2
  // Product B = quantity 3
  //
  // itemCount = 5
  itemCount: number;
};

// ============================================================
// GET CART RESPONSE
// ============================================================

export type GetCartResponse = {
  success: boolean;

  data: Cart;
};

// ============================================================
// ADD TO CART INPUT
// ============================================================

export type AddToCartInput = {
  productId: string;

  variantId?: string;

  quantity: number;
};

// ============================================================
// UPDATE CART ITEM INPUT
// ============================================================

export type UpdateCartItemInput = {
  itemId: string;

  quantity: number;
};

// ============================================================
// ADD / UPDATE CART RESPONSE
// ============================================================
//
// POST /api/cart
// PATCH /api/cart/items/[id]
//
// Both return the updated cart.
//

export type CartMutationResponse = {
  success: boolean;

  data: Cart;

  message?: string;
};

// ============================================================
// REMOVE CART ITEM RESPONSE
// ============================================================

export type RemoveCartItemResponse = {
  success: boolean;

  message: string;
};

// ============================================================
// CLEAR CART RESPONSE
// ============================================================

export type ClearCartResponse = {
  success: boolean;

  message: string;
};