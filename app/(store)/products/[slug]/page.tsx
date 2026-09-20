"use client";

import { notFound, useParams } from "next/navigation";

import { useProduct } from "@/lib/query/products/product-hooks";
import { ProductDetails } from "@/components/storefront/product-details/product-details";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();

  const slug = params.slug;

  const {
    data,
    isLoading,
    isError,
  } = useProduct(slug);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-360 px-4 py-8 sm:px-6 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image skeleton */}
            <div className="aspect-square animate-pulse rounded-xl bg-[#E2E8F0]" />

            {/* Product information skeleton */}
            <div className="space-y-5">
              <div className="h-4 w-24 animate-pulse rounded bg-[#E2E8F0]" />

              <div className="h-10 w-3/4 animate-pulse rounded bg-[#E2E8F0]" />

              <div className="h-6 w-32 animate-pulse rounded bg-[#E2E8F0]" />

              <div className="h-24 w-full animate-pulse rounded bg-[#E2E8F0]" />

              <div className="h-12 w-full animate-pulse rounded bg-[#E2E8F0]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Product not found or API error
  if (isError || !data?.data) {
    notFound();
  }

  const product = data.data;

  return <ProductDetails product={product} />;
}