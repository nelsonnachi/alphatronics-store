"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";

import { useAddToCart } from "@/lib/query/cart/use-cart-hooks";
import type { Product } from "@/lib/query/products/product-types";

import { Button } from "../ui/button";

type ProductListProps = {
  products: Product[];
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

export function ProductList({
  products,
}: ProductListProps) {
  const addToCartMutation = useAddToCart();

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center">
        <p className="text-sm font-semibold text-[#0F172A]">
          No products found
        </p>

        <p className="mt-1 text-xs text-[#64748B]">
          Try changing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const primaryImage =
          product.images.find(
            (image) => image.isPrimary,
          ) ?? product.images[0];

        const discount =
          product.compareAtPrice &&
          Number(product.compareAtPrice) >
            Number(product.price)
            ? Math.round(
                ((Number(product.compareAtPrice) -
                  Number(product.price)) /
                  Number(product.compareAtPrice)) *
                  100,
              )
            : null;

        function handleAddToCart() {
          addToCartMutation.mutate({
            productId: product.id,
            quantity: 1,
          });
        }

        return (
          <article
            key={product.id}
            className="group relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white p-3 transition-shadow duration-200 hover:shadow-md sm:p-4"
          >
            <div className="flex gap-4 sm:gap-5">
              {/* IMAGE */}

              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-md bg-[#F1F5F9] sm:h-40 sm:w-40">
                {product.isNewArrival && (
                  <span className="absolute left-2 top-2 z-10 rounded bg-[#16A34A] px-2 py-1 text-[9px] font-semibold text-white">
                    New Arrival
                  </span>
                )}

                {!product.isNewArrival &&
                  product.isBestSeller && (
                    <span className="absolute left-2 top-2 z-10 rounded bg-orange-500 px-2 py-1 text-[9px] font-semibold text-white">
                      Best Seller
                    </span>
                  )}

                {product.isFeatured &&
                  !product.isNewArrival &&
                  !product.isBestSeller && (
                    <span className="absolute left-2 top-2 z-10 rounded bg-[#2563EB] px-2 py-1 text-[9px] font-semibold text-white">
                      Featured
                    </span>
                  )}

                <Link
                  href={`/products/${product.slug}`}
                  className="block h-full w-full"
                >
                  <Image
                    src={
                      primaryImage?.url ??
                      "/images/products/product-placeholder.jpg"
                    }
                    alt={
                      primaryImage?.altText ??
                      product.name
                    }
                    fill
                    sizes="160px"
                    className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>

              {/* PRODUCT INFORMATION */}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {product.brand && (
                      <p className="mb-1 text-[10px] text-[#94A3B8]">
                        {product.brand.name}
                      </p>
                    )}

                    <Link
                      href={`/products/${product.slug}`}
                    >
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#0F172A] transition-colors hover:text-[#2563EB] sm:text-base">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <button
                    type="button"
                    aria-label={`Add ${product.name} to wishlist`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    <Heart className="size-4" />
                  </button>
                </div>

                {/* DESCRIPTION */}

                <p className="mt-2 hidden max-w-2xl line-clamp-2 text-xs leading-5 text-[#64748B] sm:block">
                  {product.shortDescription ??
                    product.description}
                </p>

                {/* RATING */}

                <div className="mt-2 flex items-center gap-1">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />

                  <span className="text-[10px] font-medium text-[#0F172A]">
                    {product.avgRating}
                  </span>

                  <span className="text-[10px] text-[#94A3B8]">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* PRICE */}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-[#0F172A]">
                        {formatPrice(
                          product.price,
                        )}
                      </p>

                      {product.compareAtPrice && (
                        <p className="text-[10px] text-[#94A3B8] line-through">
                          {formatPrice(
                            product.compareAtPrice,
                          )}
                        </p>
                      )}
                    </div>

                    {discount !== null && (
                      <p className="mt-1 text-[9px] font-medium text-green-600">
                        Save {discount}%
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={
                      addToCartMutation.isPending ||
                      product.stockStatus ===
                        "out_of_stock"
                    }
                    className="h-9 w-full rounded-md bg-[#2563EB] px-5 text-[10px] font-semibold hover:bg-[#1D4ED8] sm:w-auto"
                  >
                    <ShoppingCart className="mr-1.5 size-3.5" />

                    {product.stockStatus ===
                    "out_of_stock"
                      ? "Out of Stock"
                      : addToCartMutation.isPending
                        ? "Adding..."
                        : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}