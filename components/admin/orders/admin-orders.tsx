"use client";

import { useState } from "react";
import {
  ShoppingBag,
} from "lucide-react";

import {
  useAdminOrders,
} from "@/lib/query/orders/admin-order-hooks";

import type {
  OrderStatus,
} from "@/lib/query/orders/order-types";

import { OrderFilters } from "./order-filters";
import { OrderTable } from "./order-table";

export function AdminOrders() {
  // ============================================================
  // UI STATE
  // ============================================================

  const [page, setPage] =
    useState(1);

  const [status, setStatus] =
    useState<
      "all" | OrderStatus
    >("all");

  // ============================================================
  // QUERY PARAMS
  // ============================================================

  const queryParams = {
    page,

    limit: 10,

    status:
      status === "all"
        ? undefined
        : status,
  };

  // ============================================================
  // GET ORDERS
  // ============================================================

  const {
    data,
    isLoading,
    isError,
    error,
  } =
    useAdminOrders(
      queryParams,
    );

  // ============================================================
  // API DATA
  // ============================================================

  const orders =
    data?.data ?? [];

  const pagination =
    data?.pagination;

  // ============================================================
  // FILTER
  // ============================================================

  function handleStatusChange(
    value:
      | "all"
      | OrderStatus,
  ) {
    setStatus(value);
    setPage(1);
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer orders and fulfillment.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading orders...
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer orders and fulfillment.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">
            Failed to load orders.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Something went wrong."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <ShoppingBag className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer orders and fulfillment.
          </p>
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ======================================================= */}

      <OrderFilters
        status={status}
        onStatusChange={
          handleStatusChange
        }
      />

      {/* ======================================================
          SUMMARY
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pagination?.total ??
              0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Orders on Page
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Page
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pagination?.page ??
              1}
          </p>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}

      <OrderTable
        orders={orders}
      />

      {/* ======================================================
          PAGINATION
      ======================================================= */}

      {pagination &&
        pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page{" "}
              {pagination.page}{" "}
              of{" "}
              {
                pagination.totalPages
              }
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  pagination.page ===
                  1
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1,
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  pagination.page ===
                  pagination.totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </section>
  );
}