import type { Product } from "@/lib/query/products/product-types";

type ProductStatusBadgeProps = {
  product: Product;
};

export function ProductStatusBadge({
  product,
}: ProductStatusBadgeProps) {
  // Product is inactive
  if (!product.isActive) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
        Inactive
      </span>
    );
  }

  // Product has no available stock
  if (product.stockStatus === "out_of_stock") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        Out of stock
      </span>
    );
  }

  // Product stock is low
  if (product.stockStatus === "low_stock") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        Low stock
      </span>
    );
  }

  // Product is available for pre-order
  if (product.stockStatus === "preorder") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
        Pre-order
      </span>
    );
  }

  // Product has been discontinued
  if (product.stockStatus === "discontinued") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
        Discontinued
      </span>
    );
  }

  // Product is active and has normal stock
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
      In stock
    </span>
  );
}