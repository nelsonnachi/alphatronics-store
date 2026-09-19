"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./use-cart-api";

import { cartKeys } from "./use-cart-keys";
import { AddToCartInput, UpdateCartItemInput } from "./use-cart-types";



// ============================================================
// GET CURRENT CART
// ============================================================
//
// This is the main cart query.
//
// It gets the cart for the current visitor.
//
// The backend decides whether the visitor is:
// - Logged in
// - A guest
//
// We don't need to handle that here.
// ============================================================

export function useCart() {
  return useQuery({
    queryKey: cartKeys.current(),

    queryFn: () => getCart(),

    // Keep the cart reasonably fresh.
    staleTime: 60 * 1000,
  });
}

// ============================================================
// ADD TO CART
// ============================================================
//
// Used by product cards and product detail pages.
//
// Example:
//
// addToCart({
//   productId: product.id,
//   quantity: 1,
// });
// ============================================================

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddToCartInput) => addToCart(input),

    onSuccess: () => {
      // ------------------------------------------------------
      // Refresh the cart after adding a product.
      // ------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey: cartKeys.current(),
      });
    },
  });
}

// ============================================================
// UPDATE CART ITEM
// ============================================================
//
// Changes the quantity of an existing cart item.
//
// Example:
//
// updateCartItem({
//   itemId: item.id,
//   quantity: 3,
// });
// ============================================================

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCartItemInput) => updateCartItem(input),

    onSuccess: () => {
      // ------------------------------------------------------
      // Refresh the cart.
      // ------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey: cartKeys.current(),
      });
    },
  });
}

// ============================================================
// REMOVE CART ITEM
// ============================================================
//
// Removes one item from the cart.
//
// Example:
//
// removeCartItem(item.id);
// ============================================================

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),

    onSuccess: () => {
      // ------------------------------------------------------
      // Refresh the cart.
      // ------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey: cartKeys.current(),
      });
    },
  });
}

// ============================================================
// CLEAR CART
// ============================================================
//
// Removes every item from the cart.
// ============================================================

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCart(),

    onSuccess: () => {
      // ------------------------------------------------------
      // Refresh the cart after clearing it.
      // ------------------------------------------------------

      queryClient.invalidateQueries({
        queryKey: cartKeys.current(),
      });
    },
  });
}
