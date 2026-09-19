"use client";

import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import { useProducts } from "@/lib/query/products/product-hooks";

import { ProductCard } from "./product-card";

export function FeaturedProducts() {
  // ==========================================================
  // GET FEATURED PRODUCTS
  // ==========================================================

  const {
    data,
    isLoading,
    isError,
  } = useProducts({
    page: 1,
    limit: 5,
    featured: true,
  });

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const featuredProducts = data?.data ?? [];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <section className="bg-white py-6 sm:py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="h-4 w-4 text-[#2563EB]" />

            <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
              Featured Products
            </h2>
          </div>

          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center">
            <p className="text-xs text-[#64748B]">
              Loading featured products...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (isError) {
    return null;
  }

  // ==========================================================
  // NO PRODUCTS
  // ==========================================================

  if (featuredProducts.length === 0) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {/* HEADER */}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-[#2563EB]" />

            <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
              Featured Products
            </h2>
          </div>

          <Link
            href="/shop?featured=true"
            className="flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] sm:text-xs"
          >
            View All

            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* PRODUCTS */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}