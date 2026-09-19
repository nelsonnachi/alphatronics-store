"use client";

import {
  Filter,
  Grid2X2,
  List,
} from "lucide-react";

import type { ShopSort, ShopView } from "./shop-types";

type ShopToolbarProps = {
  totalProducts: number;
  currentPage: number;
  productsPerPage: number;

  view: ShopView;
  onViewChange: (view: ShopView) => void;

  sort: ShopSort;
  onSortChange: (sort: ShopSort) => void;

  onFilterOpen: () => void;
};

export function ShopToolbar({
  totalProducts,
  currentPage,
  productsPerPage,
  view,
  onViewChange,
  sort,
  onSortChange,
  onFilterOpen,
}: ShopToolbarProps) {
  // ==========================================================
  // RESULTS RANGE
  // ==========================================================

  const firstProduct =
    totalProducts === 0
      ? 0
      : (currentPage - 1) * productsPerPage + 1;

  const lastProduct = Math.min(
    currentPage * productsPerPage,
    totalProducts,
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* =====================================================
          RESULTS
      ===================================================== */}

      <p className="text-[10px] text-[#64748B]">
        Showing{" "}
        <span className="font-semibold text-[#0F172A]">
          {firstProduct}-{lastProduct}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[#0F172A]">
          {totalProducts}
        </span>{" "}
        results
      </p>

      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div className="flex items-center gap-2">
        {/* ===================================================
            MOBILE FILTER BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={onFilterOpen}
          className="flex h-9 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[10px] font-medium text-[#334155] lg:hidden"
        >
          <Filter className="size-3.5" />

          Filters
        </button>

        {/* ===================================================
            SORT
        =================================================== */}

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(
              event.target.value as ShopSort,
            )
          }
          className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-[10px] font-medium text-[#334155] outline-none focus:border-[#2563EB]"
        >
          <option value="newest">
            Sort by: Newest
          </option>

          <option value="price_asc">
            Price: Low to High
          </option>

          <option value="price_desc">
            Price: High to Low
          </option>

          <option value="rating">
            Top Rated
          </option>

          <option value="popularity">
            Most Popular
          </option>

          <option value="name_asc">
            Name: A-Z
          </option>
        </select>

        {/* ===================================================
            VIEW SWITCHER
        =================================================== */}

        <div className="flex h-9 rounded-md border border-[#E2E8F0]">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
            className={`flex w-9 items-center justify-center rounded-l-md ${
              view === "grid"
                ? "bg-blue-50 text-[#2563EB]"
                : "text-[#64748B]"
            }`}
          >
            <Grid2X2 className="size-3.5" />
          </button>

          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
            className={`flex w-9 items-center justify-center rounded-r-md border-l border-[#E2E8F0] ${
              view === "list"
                ? "bg-blue-50 text-[#2563EB]"
                : "text-[#64748B]"
            }`}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}