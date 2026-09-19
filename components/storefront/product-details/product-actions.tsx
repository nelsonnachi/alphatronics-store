"use client";

import {
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";

import type { ProductVariant } from "@/lib/query/products/product-types";
import { useAddToCart } from "@/lib/query/cart/use-cart-hooks";

import { Button } from "@/components/ui/button";

type ProductActionsProps = {
  price: string;
  stock: number;
  variants: ProductVariant[];
};

// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

// ============================================================
// VARIANT LABEL
// ============================================================

function getVariantLabel(
  variant: ProductVariant,
) {
  const attributes = variant.attributes;

  const entries = Object.entries(attributes);

  if (entries.length === 0) {
    return variant.sku;
  }

  return entries
    .map(([key, value]) => `${key}: ${value}`)
    .join(" • ");
}

// ============================================================
// PRODUCT ACTIONS
// ============================================================

export function ProductActions({
  price,
  stock,
  variants,
}: ProductActionsProps) {
  // ==========================================================
  // QUANTITY
  // ==========================================================

  const [quantity, setQuantity] = useState(1);

  // ==========================================================
  // SELECTED VARIANT
  // ==========================================================

  const activeVariants = variants.filter(
    (variant) =>
      variant.isActive && variant.stock > 0,
  );

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(
      activeVariants.length > 0
        ? activeVariants[0]
        : null,
    );

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const addToCartMutation = useAddToCart();

  // ==========================================================
  // ACTIVE PRICE
  // ==========================================================

  const activePrice =
    selectedVariant?.price ?? price;

  // ==========================================================
  // AVAILABLE STOCK
  // ==========================================================

  const availableStock =
    selectedVariant?.stock ?? stock;

  // ==========================================================
  // INCREASE QUANTITY
  // ==========================================================

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        current + 1,
        Math.min(availableStock, 50),
      ),
    );
  }

  // ==========================================================
  // DECREASE QUANTITY
  // ==========================================================

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(current - 1, 1),
    );
  }

  // ==========================================================
  // SELECT VARIANT
  // ==========================================================

  function handleVariantSelect(
    variant: ProductVariant,
  ) {
    setSelectedVariant(variant);

    setQuantity(1);
  }

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  function handleAddToCart() {
    addToCartMutation.mutate({
      productId:
        selectedVariant?.productId ??
        "",
      variantId:
        selectedVariant?.id,
      quantity,
    });
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-5">
      {/* ====================================================
          PRICE
      ==================================================== */}

      <div>
        <span className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
          {formatPrice(activePrice)}
        </span>
      </div>

      {/* ====================================================
          VARIANTS
      ==================================================== */}

      {variants.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">
            Options
          </h3>

          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const selected =
                selectedVariant?.id ===
                variant.id;

              const unavailable =
                !variant.isActive ||
                variant.stock <= 0;

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={unavailable}
                  onClick={() =>
                    handleVariantSelect(
                      variant,
                    )
                  }
                  className={`rounded-md border px-3 py-2 text-xs transition-colors ${
                    selected
                      ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                      : "border-[#E2E8F0] bg-white text-[#334155]"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {getVariantLabel(variant)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================
          STOCK
      ==================================================== */}

      <div>
        {availableStock > 0 ? (
          <p className="text-xs font-medium text-green-600">
            {availableStock <= 5
              ? `Only ${availableStock} left in stock`
              : "In stock"}
          </p>
        ) : (
          <p className="text-xs font-medium text-red-500">
            Out of stock
          </p>
        )}
      </div>

      {/* ====================================================
          QUANTITY
      ==================================================== */}

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[#334155]">
          Quantity
        </span>

        <div className="flex h-10 items-center rounded-md border border-[#E2E8F0]">
          {/* DECREASE */}

          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="flex h-full w-10 items-center justify-center text-[#64748B] hover:text-[#2563EB] disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>

          {/* QUANTITY */}

          <span className="w-10 text-center text-sm font-semibold">
            {quantity}
          </span>

          {/* INCREASE */}

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              quantity >=
              Math.min(availableStock, 50)
            }
            className="flex h-full w-10 items-center justify-center text-[#64748B] hover:text-[#2563EB] disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ====================================================
          ACTIONS
      ==================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* ADD TO CART */}

        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={
            availableStock <= 0 ||
            addToCartMutation.isPending
          }
          className="h-11 bg-[#2563EB] text-sm font-semibold hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />

          {addToCartMutation.isPending
            ? "Adding..."
            : "Add to Cart"}
        </Button>

        {/* BUY NOW */}

        <Button
          type="button"
          disabled={
            availableStock <= 0 ||
            addToCartMutation.isPending
          }
          variant="outline"
          className="h-11 border-[#2563EB] text-sm font-semibold text-[#2563EB] hover:bg-blue-50"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}