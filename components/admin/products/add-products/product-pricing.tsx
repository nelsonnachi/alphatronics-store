"use client";

import { BadgeDollarSign } from "lucide-react";

type ProductPricingProps = {
  price: string;
  compareAtPrice: string;
  costPrice: string;

  onPriceChange: (value: string) => void;
  onCompareAtPriceChange: (value: string) => void;
  onCostPriceChange: (value: string) => void;
};

function formatPreview(value: string) {
  if (!value) return "";

  const number = Number(value);

  if (Number.isNaN(number)) return "";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(number);
}

export function ProductPricing({
  price,
  compareAtPrice,
  costPrice,
  onPriceChange,
  onCompareAtPriceChange,
  onCostPriceChange,
}: ProductPricingProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <BadgeDollarSign className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Pricing
            </h2>

            <p className="text-xs text-slate-500">
              Set the selling and cost prices.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-5 md:grid-cols-3">
          {/* PRICE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Selling Price
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ₦
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  onPriceChange(event.target.value)
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {price && (
              <p className="mt-1 text-xs text-slate-400">
                {formatPreview(price)}
              </p>
            )}
          </div>

          {/* COMPARE PRICE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Compare-at Price
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ₦
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={compareAtPrice}
                onChange={(event) =>
                  onCompareAtPriceChange(event.target.value)
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Original price before discount.
            </p>
          </div>

          {/* COST */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Cost Price
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ₦
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(event) =>
                  onCostPriceChange(event.target.value)
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Your acquisition cost.
            </p>
          </div>
        </div>

        {/* CURRENCY */}

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Currency
          </label>

          <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
            NGN — Nigerian Naira
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Alphatronics currently uses NGN.
          </p>
        </div>
      </div>
    </section>
  );
}