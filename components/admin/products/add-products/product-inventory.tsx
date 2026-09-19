"use client";

import { Boxes } from "lucide-react";

type ProductInventoryProps = {
  stock: string;
  lowStockThreshold: string;
  warrantyMonths: string;
  weightKg: string;

  onStockChange: (value: string) => void;
  onLowStockThresholdChange: (value: string) => void;
  onWarrantyMonthsChange: (value: string) => void;
  onWeightKgChange: (value: string) => void;
};

export function ProductInventory({
  stock,
  lowStockThreshold,
  warrantyMonths,
  weightKg,
  onStockChange,
  onLowStockThresholdChange,
  onWarrantyMonthsChange,
  onWeightKgChange,
}: ProductInventoryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Boxes className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Inventory & Shipping
            </h2>

            <p className="text-xs text-slate-500">
              Manage stock and product shipping information.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* STOCK */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Stock
            </label>

            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) =>
                onStockChange(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* LOW STOCK */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Low Stock Threshold
            </label>

            <input
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(event) =>
                onLowStockThresholdChange(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Alert when stock reaches this level.
            </p>
          </div>

          {/* WARRANTY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Warranty
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                value={warrantyMonths}
                onChange={(event) =>
                  onWarrantyMonthsChange(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                months
              </span>
            </div>
          </div>

          {/* WEIGHT */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Weight
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.001"
                value={weightKg}
                onChange={(event) =>
                  onWeightKgChange(event.target.value)
                }
                placeholder="0.000"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}