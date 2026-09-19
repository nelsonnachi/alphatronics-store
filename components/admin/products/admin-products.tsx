"use client";

import { useState } from "react";

import { useAdminProducts } from "@/lib/query/products/admin/admin-product-hooks";

import { ProductFilters } from "./product-filters";
import { ProductTable } from "./product-table";

type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "stock_asc"
  | "stock_desc";

export function AdminProducts() {
  // ============================================================
  // FILTER STATE
  // ============================================================

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const [sort, setSort] = useState<SortOption>("newest");

  // ============================================================
  // TANSTACK QUERY
  // ============================================================

  const { data, isLoading, isError, error } = useAdminProducts({
    page,
    limit: 10,
    search: search || undefined,
    status,
    sort,
  });

  // ============================================================
  // API DATA
  // ============================================================

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  // ============================================================
  // SEARCH CHANGE
  // ============================================================

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  // ============================================================
  // STATUS CHANGE
  // ============================================================

  function handleStatusChange(value: "all" | "active" | "inactive") {
    setStatus(value);
    setPage(1);
  }

  // ============================================================
  // SORT CHANGE
  // ============================================================

  function handleSortChange(value: string) {
    setSort(value as SortOption);
    setPage(1);
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
        <p className="text-sm text-slate-500">Loading products...</p>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-12 text-center">
        <p className="text-sm font-medium text-red-700">
          Failed to load products.
        </p>

        <p className="mt-1 text-xs text-red-500">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ========================================================
          FILTERS
      ======================================================== */}

      <ProductFilters
        search={search}
        status={status}
        sort={sort}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
      />

      {/* ========================================================
          PRODUCT TABLE
      ======================================================== */}

      <ProductTable products={products} />

      {/* ========================================================
          PAGINATION
      ======================================================== */}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
