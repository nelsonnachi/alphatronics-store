import type { Product } from "@/lib/query/products/product-types";

import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({
  products,
}: ProductGridProps) {
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}