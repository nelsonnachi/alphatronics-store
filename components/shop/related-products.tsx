"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useRelatedProducts } from "@/lib/query/products/product-hooks";

import { ProductCard } from "./product-card";

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
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
            You May Also Like
          </h2>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center">
          <p className="text-xs text-[#64748B]">
            Loading related products...
          </p>
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