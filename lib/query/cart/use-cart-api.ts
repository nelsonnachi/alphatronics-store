import { apiClient } from "@/lib/api/client";
import { AddToCartInput, CartMutationResponse, ClearCartResponse, GetCartResponse, RemoveCartItemResponse, UpdateCartItemInput } from "./use-cart-types";


// ============================================================
// GET CART
// ============================================================
//
// GET /api/cart
//
// Gets the current user's cart.
//
// This works for:
// - Logged-in users
// - Guest users
//
// Your backend automatically resolves the correct cart.
// ============================================================

export async function getCart() {
  return apiClient<GetCartResponse>(
    "/api/cart",
    {
      method: "GET",
    },
  );
}

// ============================================================
// ADD TO CART
// ============================================================
//
// POST /api/cart
//
// Adds a product or product variant to the cart.
//
// If the product already exists in the cart,
// your backend increases its quantity.
// ============================================================

export async function addToCart(
  input: AddToCartInput,
) {
  return apiClient<CartMutationResponse>(
    "/api/cart",
    {
      method: "POST",

      body: JSON.stringify({
        productId:
          input.productId,

        variantId:
          input.variantId,

        quantity:
          input.quantity,
      }),
    },
  );
}

// ============================================================
// UPDATE CART ITEM
// ============================================================
//
// PATCH /api/cart/items/[id]
//
// Changes the quantity of an existing cart item.
// ============================================================

export async function updateCartItem(
  input: UpdateCartItemInput,
) {
  return apiClient<CartMutationResponse>(
    `/api/cart/items/${input.itemId}`,
    {
      method: "PATCH",

      body: JSON.stringify({
        quantity:
          input.quantity,
      }),
    },
  );
}

// ============================================================
// REMOVE CART ITEM
// ============================================================
//
// DELETE /api/cart/items/[id]
//
// Removes one item from the cart.
// ============================================================

export async function removeCartItem(
  itemId: string,
) {
  return apiClient<RemoveCartItemResponse>(
    `/api/cart/items/${itemId}`,
    {
      method: "DELETE",
    },
  );
}

// ============================================================
// CLEAR CART
// ============================================================
//
// DELETE /api/cart
//
// Removes every item from the current cart.
// ============================================================

export async function clearCart() {
  return apiClient<ClearCartResponse>(
    "/api/cart",
    {
      method: "DELETE",
    },
  );
}