import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { carts, cartItems } from "@/db/schema";

import { getOptionalUser } from "./auth";

import {
  clearGuestSessionCookie,
  getGuestSessionId,
  getOrCreateGuestSessionId,
} from "./helpers-utils";

import { ApiError } from "./api-errors";

/**
 * Maximum quantity allowed for one cart line.
 */
const MAX_CART_ITEM_QUANTITY = 50;

/**
 * Finds the cart belonging to the current visitor.
 *
 * Logged-in user:
 *   carts.userId = user.id
 *
 * Guest:
 *   carts.sessionId = guest session cookie
 *
 * If createIfMissing is false:
 *   - Do not create a new cart.
 *   - Return null if no cart exists.
 */
export async function resolveCart(options: { createIfMissing?: boolean } = {}) {
  const { createIfMissing = true } = options;

  const user = await getOptionalUser();

  // ============================================================
  // LOGGED-IN USER
  // ============================================================

  if (user) {
    let userCart = await db.query.carts.findFirst({
      where: {
        userId: user.id,
      },
    });

    // ============================================================
    // CHECK FOR EXISTING GUEST CART
    // ============================================================

    const guestSessionId = await getGuestSessionId();

    if (guestSessionId) {
      const guestCart = await db.query.carts.findFirst({
        where: {
          sessionId: guestSessionId,
        },
        with: {
          items: true,
        },
      });

      // ========================================================
      // MERGE GUEST CART INTO USER CART
      // ========================================================

      if (guestCart && guestCart.items.length > 0) {
        // ------------------------------------------------------
        // Create a user cart if one does not already exist.
        // ------------------------------------------------------

        if (!userCart) {
          const [createdCart] = await db
            .insert(carts)
            .values({
              userId: user.id,
            })
            .returning();

          if (!createdCart) {
            throw new ApiError("Unable to create cart", 500);
          }

          userCart = createdCart;
        }

        // ------------------------------------------------------
        // Move every guest item into the user's cart.
        // ------------------------------------------------------

        for (const guestItem of guestCart.items) {
          let existingItem;

          if (guestItem.variantId) {
            // Guest item has a variant.
            existingItem = await db.query.cartItems.findFirst({
              where: {
                cartId: userCart.id,
                productId: guestItem.productId,
                variantId: guestItem.variantId,
              },
            });
          } else {
            // Guest item does not have a variant.
            existingItem = await db.query.cartItems.findFirst({
              where: {
                cartId: userCart.id,
                productId: guestItem.productId,
                variantId: {
                  isNull: true,
                },
              },
            });
          }
          // ====================================================
          // ITEM ALREADY EXISTS
          // ====================================================

          if (existingItem) {
            const newQuantity = existingItem.quantity + guestItem.quantity;

            if (newQuantity > MAX_CART_ITEM_QUANTITY) {
              throw new ApiError(
                `Maximum quantity for a cart item is ${MAX_CART_ITEM_QUANTITY}`,
                400
              );
            }

            await db.update(cartItems)
              .set({
                quantity: newQuantity,
                updatedAt: new Date(),
              })
              .where(eq(cartItems.id, existingItem.id));
          }

          // ====================================================
          // ITEM DOES NOT EXIST
          // ====================================================
          else {
            await db.insert(cartItems).values({
              cartId: userCart.id,
              productId: guestItem.productId,
              variantId: guestItem.variantId ?? null,
              quantity: guestItem.quantity,
              priceAtAdd: guestItem.priceAtAdd,
            });
          }
        }

        // ------------------------------------------------------
        // Delete the old guest cart.
        //
        // cartItems are automatically deleted because
        // cartItems.cartId uses ON DELETE CASCADE.
        // ------------------------------------------------------

        await db.delete(carts).where(eq(carts.id, guestCart.id));

        // ------------------------------------------------------
        // Remove the guest cart cookie.
        // ------------------------------------------------------

        await clearGuestSessionCookie();
      }
    }

    // ============================================================
    // CREATE USER CART IF NECESSARY
    // ============================================================

    if (!userCart && createIfMissing) {
      const [createdCart] = await db
        .insert(carts)
        .values({
          userId: user.id,
        })
        .returning();

      if (!createdCart) {
        throw new ApiError("Unable to create cart", 500);
      }

      userCart = createdCart;
    }

    return userCart ?? null;
  }

  // ============================================================
  // GUEST USER
  // ============================================================

  const sessionId = createIfMissing
    ? await getOrCreateGuestSessionId()
    : await getGuestSessionId();

  // No guest session exists.
  if (!sessionId) {
    return null;
  }

  // Look for the guest's existing cart.
  let guestCart = await db.query.carts.findFirst({
    where: {
      sessionId,
    },
  });

  // ============================================================
  // CREATE GUEST CART IF NECESSARY
  // ============================================================

  if (!guestCart && createIfMissing) {
    const [createdCart] = await db
      .insert(carts)
      .values({
        sessionId,
      })
      .returning();

    if (!createdCart) {
      throw new ApiError("Unable to create cart", 500);
    }

    guestCart = createdCart;
  }

  return guestCart ?? null;
}

/**
 * Gets a complete cart with:
 *
 * - Cart items
 * - Products
 * - Product images
 * - Variants
 */
export async function getCartWithItems(cartId: string) {
  return db.query.carts.findFirst({
    where: {
      id: cartId,
    },

    with: {
      items: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              price: true,
              stock: true,
              isActive: true,
            },

            with: {
              images: {
                limit: 1,

                orderBy: {
                  position: "asc",
                },
              },
            },
          },

          variant: true,
        },
      },
    },
  });
}

/**
 * Calculates:
 *
 * - Cart subtotal
 * - Total quantity of products
 *
 * IMPORTANT:
 *
 * We do NOT trust cartItems.priceAtAdd when
 * calculating the current cart total.
 *
 * We use the current product/variant price.
 *
 * Checkout will perform another fresh price
 * and stock validation before creating the order.
 */
export function computeCartTotals(
  cart: NonNullable<Awaited<ReturnType<typeof getCartWithItems>>>
) {
  let subtotal = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    // Product may be missing if the relationship
    // no longer exists.
    if (!item.product) {
      continue;
    }

    let unitPrice: number;

    // ==========================================================
    // VARIANT PRICE
    // ==========================================================

    if (item.variant?.price !== null && item.variant?.price !== undefined) {
      unitPrice = Number(item.variant.price);
    }

    // ==========================================================
    // PRODUCT PRICE
    // ==========================================================
    else {
      unitPrice = Number(item.product.price);
    }

    subtotal += unitPrice * item.quantity;
    itemCount += item.quantity;
  }

  return {
    subtotal: Number(subtotal.toFixed(2)),
    itemCount,
  };
}
