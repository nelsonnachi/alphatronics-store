"use client";

import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type ProductFiltersProps = {
  search: string;
  status: "all" | "active" | "inactive";
  sort: string;

  onSearchChange: (value: string) => void;
  onStatusChange: ( value: "all" | "active" | "inactive" ) => void;
  onSortChange: (value: string) => void;
};

export function ProductFilters({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* SEARCH */}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>  onSearchChange(event.target.value)}
            placeholder="Search by product name, SKU..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* STATUS */}

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as
                | "all"
                | "active"
                | "inactive",
            )
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All products</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* SORT */}

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value)
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">
            Price: Low to high
          </option>
          <option value="price_desc">
            Price: High to low
          </option>
          <option value="name_asc">
            Name: A-Z
          </option>
          <option value="stock_asc">
            Stock: Low to high
          </option>
          <option value="stock_desc">
            Stock: High to low
          </option>
        </select>

        {/* MORE FILTERS */}

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <SlidersHorizontal className="h-4 w-4" />

          Filters
        </button>
      </div>
    </div>
  );
}