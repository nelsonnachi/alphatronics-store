import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { cartItems } from "@/db/schema";

import { eq, and, isNull } from "drizzle-orm";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import {
  computeCartTotals,
  getCartWithItems,
  resolveCart,
} from "@/lib/APIs/cart";

import { addCartItemSchema } from "@/lib/zod-validations/cart";

// ============================================================
// GET /api/cart
// ============================================================

export async function GET() {
  try {
    // Find the current user's cart.
    // This works for both:
    //
    // 1. Logged-in users
    // 2. Guest users
    //
    const cart = await resolveCart({
      createIfMissing: false,
    });

    // No cart exists.
    if (!cart) {
      return Response.json({
        success: true,

        data: {
          id: null,
          items: [],
          subtotal: 0,
          itemCount: 0,
        },
      });
    }

    // Get the cart together with:
    //
    // - cart items
    // - products
    // - product images
    // - variants
    const fullCart = await getCartWithItems(cart.id);

    if (!fullCart) {
      return Response.json({
        success: true,

        data: {
          id: null,
          items: [],
          subtotal: 0,
          itemCount: 0,
        },
      });
    }

    // Calculate subtotal and number of items.
    const totals = computeCartTotals(fullCart);

    return Response.json({
      success: true,

      data: {
        ...fullCart,
        ...totals,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// POST /api/cart
// Add a product or product variant to cart.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // Validate request body.
    //
    // Example:
    //
    // {
    //   "productId": "...",
    //   "variantId": "...",
    //   "quantity": 2
    // }
    const input = addCartItemSchema.parse(await req.json());

    // Find or create the current cart.
    const cart = await resolveCart({
      createIfMissing: true,
    });

    if (!cart) {
      throw new ApiError("Could not resolve cart", 500);
    }

    // ========================================================
    // DATABASE TRANSACTION
    // ========================================================

    await db.transaction(async (tx) => {
      // ------------------------------------------------------
      // 1. FIND PRODUCT
      // ------------------------------------------------------

      const product = await tx.query.products.findFirst({
        where: {
          id: input.productId,
        },
      });

      if (!product || !product.isActive) {
        throw new ApiError("Product not found", 404);
      }

      // Start with the main product price
      // and stock.
      let unitPrice = Number(product.price);

      let availableStock = product.stock;

      // ------------------------------------------------------
      // 2. CHECK VARIANT
      // ------------------------------------------------------

      if (input.variantId) {
        const variant = await tx.query.productVariants.findFirst({
          where: {
            id: input.variantId,

            productId: product.id,
          },
        });

        if (!variant || !variant.isActive) {
          throw new ApiError("Selected variant not found", 404);
        }

        // If variant has its own price,
        // use the variant price.
        if (variant.price !== null) {
          unitPrice = Number(variant.price);
        }

        // Variant has its own stock.
        availableStock = variant.stock;
      }

      // ------------------------------------------------------
      // 3. CHECK STOCK
      // ------------------------------------------------------

      if (input.quantity > availableStock) {
        throw new ApiError(`Only ${availableStock} unit(s) left in stock`, 409);
      }

      // ------------------------------------------------------
      // 4. FIND EXISTING CART ITEM
      // ------------------------------------------------------

      let existingItem: typeof cartItems.$inferSelect | undefined;

      // ======================================================
      // PRODUCT HAS VARIANT
      // ======================================================

      if (input.variantId) {
        existingItem = await tx.query.cartItems.findFirst({
          where: {
            cartId: cart.id,

            productId: input.productId,

            variantId: input.variantId,
          },
        });
      }

      // ======================================================
      // PRODUCT DOES NOT HAVE VARIANT
      // ======================================================
      else {
        const items = await tx
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.cartId, cart.id),

              eq(cartItems.productId, input.productId),

              isNull(cartItems.variantId),
            ),
          )
          .limit(1);

        existingItem = items[0];
      }

      // ------------------------------------------------------
      // 5. UPDATE EXISTING ITEM
      // ------------------------------------------------------

      if (existingItem) {
        const newQuantity = existingItem.quantity + input.quantity;

        if (newQuantity > availableStock) {
          throw new ApiError(
            `Only ${availableStock} unit(s) left in stock`,
            409,
          );
        }

        await tx
          .update(cartItems)
          .set({
            quantity: newQuantity,

            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingItem.id));
      }

      // ------------------------------------------------------
      // 6. CREATE NEW CART ITEM
      // ------------------------------------------------------
      else {
        await tx.insert(cartItems).values({
          cartId: cart.id,

          productId: input.productId,

          variantId: input.variantId ?? null,

          quantity: input.quantity,

          // Store the price at the
          // moment the item was added.
          //
          // Checkout will perform
          // another fresh price check.
          priceAtAdd: String(unitPrice),
        });
      }
    });

    // ========================================================
    // RETURN UPDATED CART
    // ========================================================

    const fullCart = await getCartWithItems(cart.id);

    if (!fullCart) {
      throw new ApiError("Could not load updated cart", 500);
    }

    const totals = computeCartTotals(fullCart);

    return Response.json(
      {
        success: true,

        data: {
          ...fullCart,
          ...totals,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// DELETE /api/cart
// Remove every item from the current cart.
// ============================================================

export async function DELETE() {
  try {
    const cart = await resolveCart({
      createIfMissing: false,
    });

    // There is no cart.
    if (!cart) {
      return Response.json({
        success: true,

        message: "Cart cleared",
      });
    }

    // Delete all cart items.
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return Response.json({
      success: true,

      message: "Cart cleared",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
