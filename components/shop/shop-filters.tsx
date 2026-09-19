"use client";

import type { ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";

import type { ShopFiltersState } from "./shop-types";

type ShopFilterOption = {
  id: string;
  name: string;
  slug: string;
};

type ShopFiltersProps = {
  filters: ShopFiltersState;

  categories: ShopFilterOption[];

  brands: ShopFilterOption[];

  onFiltersChange: (
    filters: ShopFiltersState,
  ) => void;

  onClear: () => void;

  onClose?: () => void;
};

export function ShopFilters({
  filters,
  categories,
  brands,
  onFiltersChange,
  onClear,
  onClose,
}: ShopFiltersProps) {
  // ==========================================================
  // UPDATE ONE FILTER VALUE
  // ==========================================================

  function updateFilter(
    updates: Partial<ShopFiltersState>,
  ) {
    onFiltersChange({
      ...filters,
      ...updates,
    });
  }

  // ==========================================================
  // CATEGORY
  // ==========================================================

  function handleCategoryChange(
    categorySlug: string,
    checked: boolean,
  ) {
    const updatedCategories = checked
      ? [...filters.categories, categorySlug]
      : filters.categories.filter(
          (slug) => slug !== categorySlug,
        );

    updateFilter({
      categories: updatedCategories,
    });
  }

  // ==========================================================
  // BRAND
  // ==========================================================

  function handleBrandChange(
    brandSlug: string,
    checked: boolean,
  ) {
    const updatedBrands = checked
      ? [...filters.brands, brandSlug]
      : filters.brands.filter(
          (slug) => slug !== brandSlug,
        );

    updateFilter({
      brands: updatedBrands,
    });
  }

  return (
    <aside className="rounded-lg border border-[#E2E8F0] bg-white">
      {/* =====================================================
          FILTER HEADER
      ===================================================== */}

      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#0F172A]">
            Filters
          </h2>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex size-7 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F1F5F9]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-[10px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
        >
          Clear all
        </button>
      </div>

      {/* =====================================================
          CATEGORY
      ===================================================== */}

      <FilterSection title="Category">
        {categories.length === 0 ? (
          <p className="text-[10px] text-[#94A3B8]">
            No categories available.
          </p>
        ) : (
          <div className="space-y-2.5">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="checkbox"
                  name="category"
                  value={category.slug}
                  checked={filters.categories.includes(
                    category.slug,
                  )}
                  onChange={(event) =>
                    handleCategoryChange(
                      category.slug,
                      event.target.checked,
                    )
                  }
                  className="size-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                />

                <span className="text-[11px] text-[#475569]">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* =====================================================
          BRAND
      ===================================================== */}

      <FilterSection title="Brand">
        {brands.length === 0 ? (
          <p className="text-[10px] text-[#94A3B8]">
            No brands available.
          </p>
        ) : (
          <div className="space-y-2.5">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="checkbox"
                  name="brand"
                  value={brand.slug}
                  checked={filters.brands.includes(
                    brand.slug,
                  )}
                  onChange={(event) =>
                    handleBrandChange(
                      brand.slug,
                      event.target.checked,
                    )
                  }
                  className="size-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                />

                <span className="text-[11px] text-[#475569]">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* =====================================================
          PRICE RANGE
      ===================================================== */}

      <FilterSection title="Price Range">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) =>
              updateFilter({
                minPrice: event.target.value,
              })
            }
            placeholder="Min"
            className="h-8 w-full rounded-md border border-[#E2E8F0] px-2 text-[10px] outline-none focus:border-[#2563EB]"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) =>
              updateFilter({
                maxPrice: event.target.value,
              })
            }
            placeholder="Max"
            className="h-8 w-full rounded-md border border-[#E2E8F0] px-2 text-[10px] outline-none focus:border-[#2563EB]"
          />
        </div>
      </FilterSection>

      {/* =====================================================
          RATING
      ===================================================== */}

      <FilterSection title="Rating">
        <div className="space-y-2.5">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="rating"
                checked={
                  filters.minRating === rating
                }
                onChange={() =>
                  updateFilter({
                    minRating: rating,
                  })
                }
                className="size-3.5 border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
              />

              <span className="text-[11px] text-[#475569]">
                {rating}★ & up
              </span>
            </label>
          ))}

          {filters.minRating !== null && (
            <button
              type="button"
              onClick={() =>
                updateFilter({
                  minRating: null,
                })
              }
              className="text-[10px] font-medium text-[#2563EB]"
            >
              Clear rating
            </button>
          )}
        </div>
      </FilterSection>

      {/* =====================================================
          AVAILABILITY
      ===================================================== */}

      <FilterSection title="Availability">
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(event) =>
                updateFilter({
                  inStock: event.target.checked,
                })
              }
              className="size-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />

            <span className="text-[11px] text-[#475569]">
              In Stock Only
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(event) =>
                updateFilter({
                  onSale: event.target.checked,
                })
              }
              className="size-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />

            <span className="text-[11px] text-[#475569]">
              On Sale
            </span>
          </label>
        </div>
      </FilterSection>

      {/* =====================================================
          MOBILE APPLY BUTTON
      ===================================================== */}

      {onClose && (
        <div className="border-t border-[#E2E8F0] p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-full rounded-md bg-[#2563EB] text-[11px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Show Results
          </button>
        </div>
      )}
    </aside>
  );
}

// ============================================================
// REUSABLE FILTER SECTION
// ============================================================

type FilterSectionProps = {
  title: string;
  children: ReactNode;
};

function FilterSection({
  title,
  children,
}: FilterSectionProps) {
  return (
    <section className="border-b border-[#E2E8F0] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-[#0F172A]">
          {title}
        </h3>

        <ChevronDown className="size-3.5 text-[#64748B]" />
      </div>

      {children}
    </section>
  );
}