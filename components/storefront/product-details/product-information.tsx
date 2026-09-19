import {
  ShieldCheck,
  Truck,
} from "lucide-react";

import type { Product } from "@/lib/query/products/product-types";

import { ProductActions } from "./product-actions";

type ProductInformationProps = {
  product: Product;
};

export function ProductInformation({
  product,
}: ProductInformationProps) {
  return (
    <div className="flex flex-col">
      {/* ====================================================
          BRAND
      ==================================================== */}

      {product.brand && (
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
          {product.brand.name}
        </p>
      )}

      {/* ====================================================
          PRODUCT NAME
      ==================================================== */}

      <h1 className="mt-2 text-2xl font-bold leading-tight text-[#0F172A] sm:text-3xl">
        {product.name}
      </h1>

      {/* ====================================================
          SKU
      ==================================================== */}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-xs text-[#94A3B8]">
          SKU: {product.sku}
        </span>
      </div>

      <div className="my-5 h-px bg-[#E2E8F0]" />

      {/* ====================================================
          SHORT DESCRIPTION
      ==================================================== */}

      {product.shortDescription && (
        <p className="text-sm leading-6 text-[#64748B]">
          {product.shortDescription}
        </p>
      )}

      {/* ====================================================
          PRODUCT ACTIONS
      ==================================================== */}

      <div className="mt-6">
        <ProductActions
          price={product.price}
          stock={product.stock}
          variants={product.variants}
        />
      </div>

      {/* ====================================================
          SERVICE INFORMATION
      ==================================================== */}

      <div className="mt-6 space-y-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        {/* FREE SHIPPING */}

        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-[#2563EB]" />

          <div>
            <p className="text-xs font-semibold text-[#0F172A]">
              Free Shipping
            </p>

            <p className="text-[10px] text-[#64748B]">
              On qualifying orders
            </p>
          </div>
        </div>

        {/* SECURE PAYMENT */}

        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#2563EB]" />

          <div>
            <p className="text-xs font-semibold text-[#0F172A]">
              Secure Payment
            </p>

            <p className="text-[10px] text-[#64748B]">
              Your payment information is protected
            </p>
          </div>
        </div>

        {/* WARRANTY */}

        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#2563EB]" />

          <div>
            <p className="text-xs font-semibold text-[#0F172A]">
              {product.warrantyMonths}-Month Warranty
            </p>

            <p className="text-[10px] text-[#64748B]">
              Warranty included with this product
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}