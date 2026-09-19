"use client";

import { useState } from "react";
import Link from "next/link";

import {
  useAdminInventoryMovements,
} from "@/lib/query/inventories/admin-inventory-hooks";

import {
  InventoryMovementSummary,
} from "./inventory-movement-summary";

import {
  InventoryMovementFilters,
} from "./inventory-movement-filters";

import {
  InventoryMovementTable,
} from "./inventory-movement-table";

import {
  InventoryMovementPagination,
} from "./inventory-movement-pagination";

export function InventoryMovementsPage() {
  // ============================================================
  // FILTER STATE
  // ============================================================

  const [search, setSearch] = useState("");

  const [type, setType] = useState("");

  const [direction, setDirection] = useState("");

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  const [sort, setSort] = useState("newest");

  // ============================================================
  // PAGINATION STATE
  // ============================================================

  const [page, setPage] = useState(1);

  // ============================================================
  // GET INVENTORY MOVEMENTS
  // ============================================================

  const { data, isLoading, isError, error } =
    useAdminInventoryMovements({
      page,
      limit: 20,

      search: search || undefined,

      type:
        type === ""
          ? undefined
          : (type as
              | "purchase"
              | "adjustment"
              | "sale"
              | "return"
              | "release"
              | "damage"
              | "restock"),

      direction:
        direction === ""
          ? undefined
          : (direction as
              | "increase"
              | "decrease"),

      from: from || undefined,

      to: to || undefined,

      sort: sort as "newest" | "oldest",
    });

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* HEADER */}

        <div>
          <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />
        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-lg bg-slate-200"
              />
            ),
          )}
        </div>

        {/* FILTERS */}

        <div className="h-28 animate-pulse rounded-lg bg-slate-200" />

        {/* TABLE */}

        <div className="h-96 animate-pulse rounded-lg bg-slate-200" />

        {/* PAGINATION */}

        <div className="h-16 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Failed to load inventory history
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
  // PAGINATION HANDLERS
  // ============================================================

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (page < data.pagination.totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/inventory"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Inventory
            </Link>
          </div>

          <h1 className="mt-3 text-2xl font-semibold text-[#0B1F3B]">
            Inventory History
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track stock changes and inventory movements
            across your store.
          </p>
        </div>

        <Link
          href="/admin/inventory"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Inventory
        </Link>
      </div>

      {/* ======================================================
          SUMMARY
          ====================================================== */}

      <InventoryMovementSummary
        summary={data.summary}
      />

      {/* ======================================================
          FILTERS
          ====================================================== */}

      <InventoryMovementFilters
        search={search}
        type={type}
        direction={direction}
        from={from}
        to={to}
        sort={sort}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onTypeChange={(value) => {
          setType(value);
          setPage(1);
        }}
        onDirectionChange={(value) => {
          setDirection(value);
          setPage(1);
        }}
        onFromChange={(value) => {
          setFrom(value);
          setPage(1);
        }}
        onToChange={(value) => {
          setTo(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
      />

      {/* ======================================================
          TABLE
          ====================================================== */}

      <InventoryMovementTable
        movements={data.movements}
      />

      {/* ======================================================
          PAGINATION
          ====================================================== */}

      <InventoryMovementPagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        total={data.pagination.total}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
      />
    </div>
  );
}