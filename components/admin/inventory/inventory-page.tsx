"use client";

import { useState } from "react";
import Link from "next/link";

import { InventorySummary } from "./inventory-summary";
import { InventoryFilters } from "./inventory-filters";
import { InventoryTable } from "./inventory-table";
import { InventoryPagination } from "./inventory-pagination";

import { useAdminInventory } from "@/lib/query/inventories/admin-inventory-hooks";

export function InventoryPage() {
  // ============================================================
  // FILTER STATE
  // ============================================================

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("stock_asc");

  // ============================================================
  // PAGINATION STATE
  // ============================================================

  const [page, setPage] = useState(1);

  // ============================================================
  // GET INVENTORY
  // ============================================================

  const { data, isLoading, isError, error } = useAdminInventory({
    page,
    limit: 20,

    search: search || undefined,

    status:
      status === ""
        ? undefined
        : (status as
            | "in_stock"
            | "low_stock"
            | "out_of_stock"),

    type:
      type === ""
        ? undefined
        : (type as "product" | "variant"),

    sort: sort as
      | "stock_asc"
      | "stock_desc"
      | "name_asc"
      | "name_desc"
      | "newest"
      | "oldest",
  });

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* HEADER SKELETON */}

        <div>
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        {/* SUMMARY SKELETON */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg bg-slate-200"
            />
          ))}
        </div>

        {/* FILTER SKELETON */}

        <div className="h-16 animate-pulse rounded-lg bg-slate-200" />

        {/* TABLE SKELETON */}

        <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Failed to load inventory
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : "Something went wrong."}
        </p>
      </div>
    );
  }

  // ============================================================
  // NO DATA
  // ============================================================

  if (!data) {
    return null;
  }

  // ============================================================
  // PAGINATION
  // ============================================================

  const pagination = data.pagination;

  // ============================================================
  // PAGINATION HANDLERS
  // ============================================================

  function handlePreviousPage() {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  }

  function handleNextPage() {
    if (page < pagination.totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  }

  // ============================================================
  // PAGE UI
  // ============================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage stock levels and inventory across your store.
          </p>
        </div>

        <Link
          href="/admin/inventory/movements"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#2563EB] px-4 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Inventory History
        </Link>
      </div>

      {/* SUMMARY */}

      <InventorySummary summary={data.summary} />

      {/* FILTERS */}

      <InventoryFilters
        search={search}
        status={status}
        type={type}
        sort={sort}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onTypeChange={(value) => {
          setType(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
      />

      {/* TABLE */}

      <InventoryTable inventory={data.inventory} />

      {/* PAGINATION */}

      <InventoryPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
      />
    </div>
  );
}