"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

import { useProducts } from "@/lib/query/products/product-hooks";

import { ProductCard } from "./product-card";
import { ProductSectionSkeleton } from "./product-section-skeleton";

export function NewArrivals() {
  // ==========================================================
  // GET NEW ARRIVALS
  // ==========================================================

  const {
    data,
    isLoading,
    isError,
  } = useProducts({
    page: 1,
    limit: 5,
    newArrival: true,
  });

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const newProducts = data?.data ?? [];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return <ProductSectionSkeleton variant="new-arrivals" />;
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

  if (newProducts.length === 0) {
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
            <Zap className="h-4 w-4 fill-[#2563EB] text-[#2563EB]" />

            <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop?newArrival=true"
            className="flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] sm:text-xs"
          >
            View All

            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* PRODUCTS */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {newProducts.map((product) => (
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