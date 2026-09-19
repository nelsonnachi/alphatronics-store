"use client";

import Link from "next/link";

import {
  Headphones,
  Laptop,
  Gamepad2,
  Smartphone,
  Package,
} from "lucide-react";

import type { BestSeller } from "@/lib/query/dashboard/admin-dashboard-types";

type TopSellingProductsProps = {
  products: BestSeller[];
};

function getProductIcon(name: string) {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes("phone") ||
    lowerName.includes("galaxy") ||
    lowerName.includes("iphone")
  ) {
    return Smartphone;
  }

  if (
    lowerName.includes("macbook") ||
    lowerName.includes("laptop") ||
    lowerName.includes("computer")
  ) {
    return Laptop;
  }

  if (
    lowerName.includes("playstation") ||
    lowerName.includes("xbox") ||
    lowerName.includes("console") ||
    lowerName.includes("game")
  ) {
    return Gamepad2;
  }

  if (
    lowerName.includes("headphone") ||
    lowerName.includes("earbud") ||
    lowerName.includes("airpod")
  ) {
    return Headphones;
  }

  return Package;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TopSellingProducts({
  products,
}: TopSellingProductsProps) {
  return (
    <section className="rounded-[14px] border border-[#e7eaf1] bg-white p-5 sm:p-[22px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-[#0f172a]">
          Top Selling Products
        </h3>

        <Link
          href="/admin/reports"
          className="text-[12.5px] font-semibold text-[#2f5fe0] hover:underline"
        >
          View report →
        </Link>
      </div>

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f6fb] text-[#8993a4]">
            <Package className="h-5 w-5" />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#0f172a]">
            No sales yet
          </p>

          <p className="mt-1 text-xs text-[#8993a4]">
            There are no top-selling products for
            this period.
          </p>
        </div>
      )}

      {products.length > 0 && (
        <div>
          {products
            .slice(0, 5)
            .map((product) => {
              const Icon =
                getProductIcon(product.name);

              return (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 border-b border-[#e7eaf1] py-[11px] last:border-b-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] border border-[#e7eaf1] bg-[#f4f6fb] text-[#8993a4]">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-[#0f172a]">
                      {product.name}
                    </div>

                    <div className="mt-px text-[11.5px] text-[#5b6472]">
                      {product.unitsSold.toLocaleString(
                        "en-NG",
                      )}{" "}
                      units sold
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[13px] font-bold text-[#0f172a]">
                      {formatCurrency(
                        product.revenue,
                      )}
                    </div>

                    <div className="text-[11px] text-[#5b6472]">
                      revenue
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}