"use client";

import Link from "next/link";

import {
  AlertTriangle,
  Package,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
} from "lucide-react";

import type { AdminDashboardData } from "@/lib/query/dashboard/admin-dashboard-types";

type LowStockAlertsProps = {
  data: AdminDashboardData["inventory"];
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
    lowerName.includes("headphone") ||
    lowerName.includes("earbud") ||
    lowerName.includes("airpod")
  ) {
    return Headphones;
  }

  if (
    lowerName.includes("tv") ||
    lowerName.includes("television")
  ) {
    return Tv;
  }

  return Package;
}

export function LowStockAlerts({
  data,
}: LowStockAlertsProps) {
  const items = [
    ...data.lowStockItems,
    ...data.lowStockVariants,
  ];

  return (
    <section className="rounded-[14px] border border-[#e7eaf1] bg-white p-5 sm:p-[22px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-[#0f172a]">
          Low Stock Alerts
        </h3>

        <Link
          href="/admin/inventory"
          className="text-[12.5px] font-semibold text-[#2f5fe0] hover:underline"
        >
          View inventory →
        </Link>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f8f0] text-[#17a266]">
            <Package className="h-5 w-5" />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#0f172a]">
            No low stock items
          </p>

          <p className="mt-1 text-xs text-[#8993a4]">
            Your inventory is currently above its
            low stock thresholds.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div>
          {items
            .slice(0, 5)
            .map((item, index) => {
              const Icon =
                getProductIcon(
                  item.productName,
                );

              const isCritical =
                item.availableStock <= 2;

              return (
                <div
                  key={
                    item.variantId ??
                    `${item.productId}-${index}`
                  }
                  className="flex items-center gap-3 border-b border-[#e7eaf1] py-[11px] last:border-b-0"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] border ${
                      isCritical
                        ? "border-[#fbeae7] bg-[#fbeae7] text-[#e0533f]"
                        : "border-[#e7eaf1] bg-[#f4f6fb] text-[#8993a4]"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-[#0f172a]">
                      {item.productName}
                    </div>

                    <div className="mt-px truncate text-[11.5px] text-[#5b6472]">
                      {item.type === "variant" &&
                      item.variantName
                        ? item.variantName
                        : item.sku}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div
                      className={`flex items-center justify-end gap-1 text-[14px] font-extrabold ${
                        isCritical
                          ? "text-[#e0533f]"
                          : "text-[#e08a1f]"
                      }`}
                    >
                      {isCritical && (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}

                      {item.availableStock} left
                    </div>

                    <div className="text-[10.5px] text-[#8993a4]">
                      reorder at{" "}
                      {item.lowStockThreshold ?? "—"}
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