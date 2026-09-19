import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { cartItems } from "@/db/schema";

import { eq } from "drizzle-orm";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import {
  computeCartTotals,
  getCartWithItems,
  resolveCart,
} from "@/lib/APIs/cart";

import { updateCartItemSchema } from "@/lib/zod-validations/cart";

// ============================================================
// PATCH /api/cart/items/[id]
// Update quantity of one cart item.
// ============================================================

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    // Validate request.
    //
    // Example:
    //
    // {
    //   "quantity": 3
    // }
    const input = updateCartItemSchema.parse(await req.json());

    // Find current cart.
    const cart = await resolveCart({
      createIfMissing: false,
    });

    if (!cart) {
      throw new ApiError("Cart not found", 404);
    }

    // Find cart item.
    const existingItem = await db.query.cartItems.findFirst({
      where: {
        id,

        cartId: cart.id,
      },
    });

    if (!existingItem) {
      throw new ApiError("Cart item not found", 404);
    }

    // ========================================================
    // FIND PRODUCT
    // ========================================================

    const product = await db.query.products.findFirst({
      where: {
        id: existingItem.productId,
      },
    });

    if (!product || !product.isActive) {
      throw new ApiError("Product is no longer available", 409);
    }

    // ========================================================
    // DETERMINE AVAILABLE STOCK
    // ========================================================

    let availableStock = product.stock;

    if (existingItem.variantId) {
      const variant = await db.query.productVariants.findFirst({
        where: {
          id: existingItem.variantId,

          productId: product.id,
        },
      });

      if (!variant || !variant.isActive) {
        throw new ApiError(
          "Selected product variant is no longer available",
          409,
        );
      }

      availableStock = variant.stock;
    }

    // ========================================================
    // CHECK STOCK
    // ========================================================

    if (input.quantity > availableStock) {
      throw new ApiError(`Only ${availableStock} unit(s) left in stock`, 409);
    }

    // ========================================================
    // UPDATE QUANTITY
    // ========================================================

    await db
      .update(cartItems)
      .set({
        quantity: input.quantity,

        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, existingItem.id));

    // ========================================================
    // RETURN UPDATED CART
    // ========================================================

    const fullCart = await getCartWithItems(cart.id);

    if (!fullCart) {
      throw new ApiError("Could not load updated cart", 500);
    }

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
// DELETE /api/cart/items/[id]
// Remove one cart item.
// ============================================================

export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    // Find current cart.
    const cart = await resolveCart({
      createIfMissing: false,
    });

    if (!cart) {
      throw new ApiError("Cart not found", 404);
    }

    // Find the item and make sure
    // it belongs to this cart.
    const existingItem = await db.query.cartItems.findFirst({
      where: {
        id,

        cartId: cart.id,
      },
    });

    if (!existingItem) {
      throw new ApiError("Cart item not found", 404);
    }

    // Delete the item.
    await db.delete(cartItems).where(eq(cartItems.id, existingItem.id));

    // Return success.
    return Response.json({
      success: true,

      message: "Cart item removed successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
