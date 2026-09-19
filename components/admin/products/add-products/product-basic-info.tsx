"use client";

import { useAdminBrands } from "@/lib/query/brands/admin/admin-brand-hooks";
import { useAdminCategories } from "@/lib/query/categories/admin/admin-category-hooks";
import { FileText } from "lucide-react";


type ProductBasicInfoProps = {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId: string;
  description: string;
  shortDescription: string;

  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSkuChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onShortDescriptionChange: (value: string) => void;
};

export function ProductBasicInfo({
  name,
  slug,
  sku,
  categoryId,
  brandId,
  description,
  shortDescription,
  onNameChange,
  onSlugChange,
  onSkuChange,
  onCategoryChange,
  onBrandChange,
  onDescriptionChange,
  onShortDescriptionChange,
}: ProductBasicInfoProps) {
  // ============================================================
  // GET CATEGORIES
  // ============================================================

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useAdminCategories();

  // ============================================================
  // GET BRANDS
  // ============================================================

  const {
    data: brandsData,
    isLoading: brandsLoading,
    isError: brandsError,
  } = useAdminBrands();

  // ============================================================
  // API DATA
  // ============================================================

  const categories = categoriesData?.data ?? [];
  const brands = brandsData?.data ?? [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      {/* HEADER */}

      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Basic Information</h2>

            <p className="text-xs text-slate-500">
              Basic information about your product.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* NAME */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Product Name
          </label>

          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="e.g. Apple iPhone 15 Pro Max"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* SLUG + SKU */}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Slug
            </label>

            <input
              value={slug}
              onChange={(event) => onSlugChange(event.target.value)}
              placeholder="apple-iphone-15-pro-max"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Lowercase words separated by hyphens.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              SKU
            </label>

            <input
              value={sku}
              onChange={(event) => onSkuChange(event.target.value)}
              placeholder="APL-IP15PM-256"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* CATEGORY + BRAND */}

        <div className="grid gap-5 md:grid-cols-2">
          {/* CATEGORY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
              disabled={categoriesLoading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {categoriesError && (
              <p className="mt-1 text-xs text-red-500">
                Failed to load categories.
              </p>
            )}
          </div>

          {/* BRAND */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Brand
            </label>

            <select
              value={brandId}
              onChange={(event) => onBrandChange(event.target.value)}
              disabled={brandsLoading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {brandsLoading ? "Loading brands..." : "Select brand"}
              </option>

              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            {brandsError && (
              <p className="mt-1 text-xs text-red-500">
                Failed to load brands.
              </p>
            )}
          </div>
        </div>

        {/* SHORT DESCRIPTION */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Short Description
          </label>

          <input
            value={shortDescription}
            onChange={(event) => onShortDescriptionChange(event.target.value)}
            maxLength={300}
            placeholder="Short description of the product..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-xs text-slate-400">Maximum 300 characters.</p>
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={7}
            placeholder="Write a detailed description of the product..."
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-xs text-slate-400">Minimum 10 characters.</p>
        </div>
      </div>
    </section>
  );
}
