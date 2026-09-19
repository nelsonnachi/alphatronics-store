"use client";

import { useAdminPayments } from "@/lib/query/payments/admin-payments-hooks";
import { useState } from "react";
import { PaymentsTable } from "./payments-table";
import { PaymentFilters } from "./payment-filters";



export function AdminPaymentsPage() {
  const [page, setPage] = useState(1);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      | "pending"
      | "paid"
      | "failed"
      | "partially_refunded"
      | "refunded"
      | undefined
    >(undefined);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useAdminPayments({
    page,

    limit: 20,

    search,

    status,
  });

  const payments =
    data?.data ?? [];

  const pagination =
    data?.pagination;

  function handleSearch(
    value: string,
  ) {
    setSearch(value);

    // Go back to first page
    // whenever the search changes.
    setPage(1);
  }

  function handleStatusChange(
    value:
      | "pending"
      | "paid"
      | "failed"
      | "partially_refunded"
      | "refunded"
      | undefined,
  ) {
    setStatus(value);

    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-semibold text-[#0B1F3B]">
          Payments
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage customer payments.
        </p>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <PaymentFilters
        search={search}
        status={status}
        onSearchChange={handleSearch}
        onStatusChange={
          handleStatusChange
        }
      />

      {/* =====================================================
          ERROR
      ===================================================== */}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Unable to load payments.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Something went wrong."}
          </p>
        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <PaymentsTable
        payments={payments}
        isLoading={isLoading}
      />

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {!isLoading && payments.length > 0 &&  pagination && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {pagination.page}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  page === 1
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
                  !pagination.hasNextPage
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
}