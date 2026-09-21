"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useRelatedProducts } from "@/lib/query/products/product-hooks";

import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "../storefront/products/product-section-skeleton";

type RelatedProductsProps = {
  slug: string;
};

export function RelatedProducts({
  slug,
}: RelatedProductsProps) {
  // ============================================================
  // GET RELATED PRODUCTS FROM API
  // ============================================================

  const {
    data,
    isLoading,
    isError,
  } = useRelatedProducts(slug);

  // ============================================================
  // GET PRODUCTS FROM API RESPONSE
  // ============================================================

  const relatedProducts = data?.data ?? [];

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <section className="mt-14">
        {/* HEADER */}

        <div className="mb-4 flex items-center justify-between">
          <SkeletonTitle />

          <SkeletonViewAll />
        </div>

        {/* PRODUCT SKELETONS */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  // ============================================================
  // API ERROR
  // ============================================================

  if (isError) {
    return null;
  }

  // ============================================================
  // NO RELATED PRODUCTS
  // ============================================================

  if (relatedProducts.length === 0) {
    return null;
  }

  // ============================================================
  // RENDER RELATED PRODUCTS
  // ============================================================

  return (
    <section className="mt-14">
      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
          You May Also Like
        </h2>

        <Link
          href="/shop"
          className="flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] sm:text-xs"
        >
          View All

          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* RELATED PRODUCTS */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================
// SKELETON HEADER
// ============================================================

function SkeletonTitle() {
  return (
    <div className="h-5 w-36 animate-pulse rounded-md bg-[#E2E8F0] sm:h-6 sm:w-44" />
  );
}

function SkeletonViewAll() {
  return (
    <div className="h-4 w-14 animate-pulse rounded-md bg-[#E2E8F0] sm:w-16" />
  );
}