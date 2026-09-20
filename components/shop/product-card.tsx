"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";

import { useAddToCart } from "@/lib/query/cart/use-cart-hooks";
import type {
  Product,
  RelatedProduct,
} from "@/lib/query/products/product-types";

import { Button } from "@/components/ui/button";

// ============================================================
// PRODUCT TYPE
// ============================================================

type ProductCardProduct = Product | RelatedProduct;

type ProductCardProps = {
  product: ProductCardProduct;
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
// PRODUCT CARD
// ============================================================

export function ProductCard({ product }: ProductCardProps) {
  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const addToCartMutation = useAddToCart();

  // ==========================================================
  // PRIMARY IMAGE
  // ==========================================================

  const primaryImage =
    product.images.find((image) => image.isPrimary) ?? product.images[0];

  // ==========================================================
  // DISCOUNT
  // ==========================================================

  const discount =
    product.compareAtPrice &&
    Number(product.compareAtPrice) > Number(product.price)
      ? Math.round(
          ((Number(product.compareAtPrice) - Number(product.price)) /
            Number(product.compareAtPrice)) *
            100,
        )
      : null;

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  function handleAddToCart() {
    addToCartMutation.mutate({
      productId: product.id,
      quantity: 1,
    });
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <article className="group relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white transition-shadow duration-200 hover:shadow-md">
      {/* ======================================================
          PRODUCT IMAGE
      ====================================================== */}

      <div className="relative aspect-square bg-white p-3">
        {/* ====================================================
            PRODUCT BADGE
        ==================================================== */}

        {product.isNewArrival && (
          <span className="absolute left-2 top-2 z-10 rounded bg-[#16A34A] px-2 py-1 text-[9px] font-semibold text-white">
            New Arrival
          </span>
        )}

        {!product.isNewArrival && product.isBestSeller && (
          <span className="absolute left-2 top-2 z-10 rounded bg-orange-500 px-2 py-1 text-[9px] font-semibold text-white">
            Best Seller
          </span>
        )}

        {!product.isNewArrival &&
          !product.isBestSeller &&
          "isFeatured" in product &&
          product.isFeatured && (
            <span className="absolute left-2 top-2 z-10 rounded bg-[#2563EB] px-2 py-1 text-[9px] font-semibold text-white">
              Featured
            </span>
          )}

        {/* ====================================================
            WISHLIST BUTTON
        ==================================================== */}

        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-[#2563EB] hover:text-[#2563EB]"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>

        {/* ====================================================
            PRODUCT IMAGE
        ==================================================== */}

        <Link
          href={`/products/${product.slug}`}
          className="block h-full w-full"
        >
          <Image
            src={
              primaryImage?.url ?? "/images/products/product-placeholder.jpg"
            }
            alt={primaryImage?.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-7 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* ======================================================
          PRODUCT INFORMATION
      ====================================================== */}

      <div className="px-3 pb-3">
        {/* ====================================================
            BRAND
        ==================================================== */}

        {product.brand && (
          <p className="mb-1 text-[9px] text-[#94A3B8]">{product.brand.name}</p>
        )}

        {/* ====================================================
            PRODUCT NAME
        ==================================================== */}

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-8 text-xs font-medium leading-4 text-[#0F172A] transition-colors hover:text-[#2563EB]">
            {product.name}
          </h3>
        </Link>

        {/* ====================================================
            PRICE
        ==================================================== */}

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-[#0F172A]">
            {formatPrice(product.price)}
          </p>

          {product.compareAtPrice &&
            Number(product.compareAtPrice) > Number(product.price) && (
              <p className="text-[9px] text-[#94A3B8] line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            )}
        </div>

        {/* ====================================================
            DISCOUNT
        ==================================================== */}

        {discount !== null && (
          <p className="mt-1 text-[9px] font-medium text-green-600">
            Save {discount}%
          </p>
        )}

        {/* ====================================================
            STOCK STATUS
        ==================================================== */}

        {product.stockStatus === "low_stock" && (
          <p className="mt-1 text-[9px] font-medium text-orange-500">
            Only {product.stock} left
          </p>
        )}

        {/* ====================================================
            ADD TO CART
        ==================================================== */}

        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={
            addToCartMutation.isPending ||
            product.stockStatus === "out_of_stock" ||
            product.stock <= 0
          }
          className="mt-3 h-8 w-full rounded-md bg-[#2563EB] text-[10px] font-semibold hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <ShoppingCart className="mr-1.5 h-3 w-3" />

          {product.stockStatus === "out_of_stock" || product.stock <= 0
            ? "Out of Stock"
            : addToCartMutation.isPending
              ? "Adding..."
              : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}
