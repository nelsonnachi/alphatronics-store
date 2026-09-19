"use client";

import { Eye, Sparkles, Star, TrendingUp } from "lucide-react";

type ProductStatusProps = {
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;

  onFeaturedChange: (value: boolean) => void;
  onNewArrivalChange: (value: boolean) => void;
  onBestSellerChange: (value: boolean) => void;
  onActiveChange: (value: boolean) => void;
};

export function ProductStatus({
  isFeatured,
  isNewArrival,
  isBestSeller,
  isActive,
  onFeaturedChange,
  onNewArrivalChange,
  onBestSellerChange,
  onActiveChange,
}: ProductStatusProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white lg:sticky lg:top-6">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">
          Product Status
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Control how this product appears in your store.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <Toggle
          label="Active"
          description="Product is visible in the store."
          checked={isActive}
          onChange={onActiveChange}
          icon={<Eye className="h-4 w-4" />}
        />

        <Toggle
          label="Featured"
          description="Show in featured products."
          checked={isFeatured}
          onChange={onFeaturedChange}
          icon={<Star className="h-4 w-4" />}
        />

        <Toggle
          label="New Arrival"
          description="Mark as a new arrival."
          checked={isNewArrival}
          onChange={onNewArrivalChange}
          icon={<Sparkles className="h-4 w-4" />}
        />

        <Toggle
          label="Best Seller"
          description="Mark as a best-selling product."
          checked={isBestSeller}
          onChange={onBestSellerChange}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>
    </section>
  );
}

type ToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: React.ReactNode;
};

function Toggle({
  label,
  description,
  checked,
  onChange,
  icon,
}: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 text-left"
    >
      <div
        className={`mt-0.5 rounded-lg p-2 ${
          checked
            ? "bg-blue-50 text-blue-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-800">
            {label}
          </p>

          <div
            className={`relative h-5 w-9 rounded-full transition ${
              checked ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                checked ? "left-[18px]" : "left-0.5"
              }`}
            />
          </div>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
}