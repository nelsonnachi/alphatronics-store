"use client";

import { useState } from "react";

import {
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  CustomerFilters,
} from "./customer-filters";

import {
  CustomerTable,
} from "./customer-table";

import { useAdminUsers, useCurrentUser, useUpdateAdminUser } from "@/lib/query/users/user-hooks";
import { AdminUser, AdminUserQueryParams, UserRole } from "@/lib/query/users/user-types";



export function AdminCustomers() {
  // ============================================================
  // UI STATE
  // ============================================================

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      "all" | "active" | "banned"
    >("all");

  const [role, setRole] =
    useState<
      "all" | UserRole
    >("all");

  const [sort, setSort] =
    useState<
      | "newest"
      | "oldest"
      | "name_asc"
      | "name_desc"
    >("newest");

  // ============================================================
  // CURRENT USER
  // ============================================================

  const {
    data: currentUserData,
    isLoading:
      isCurrentUserLoading,
    isError:
      isCurrentUserError,
  } = useCurrentUser();

  const currentUser =
    currentUserData?.data;

  const isSuperAdmin =
    currentUser?.role ===
    "super_admin";

  // ============================================================
  // QUERY PARAMETERS
  // ============================================================

  const queryParams:
    AdminUserQueryParams = {
    page,

    limit: 10,

    search:
      search.trim() || undefined,

    status:
      status === "all"
        ? undefined
        : status,

    role:
      role === "all"
        ? undefined
        : role,

    sort,
  };

  // ============================================================
  // GET USERS
  // ============================================================

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } =
    useAdminUsers(
      queryParams,
    );

  // ============================================================
  // UPDATE USER
  // ============================================================

  const updateUserMutation =
    useUpdateAdminUser();

  // ============================================================
  // API DATA
  // ============================================================

  const users =
    data?.data ?? [];

  const pagination =
    data?.pagination;

  // ============================================================
  // RESET PAGE
  // ============================================================

  function resetPage() {
    setPage(1);
  }

  // ============================================================
  // SEARCH
  // ============================================================

  function handleSearch(
    value: string,
  ) {
    setSearch(value);

    resetPage();
  }

  // ============================================================
  // STATUS
  // ============================================================

  function handleStatus(
    value:
      | "all"
      | "active"
      | "banned",
  ) {
    setStatus(value);

    resetPage();
  }

  // ============================================================
  // ROLE
  // ============================================================

  function handleRole(
    value:
      | "all"
      | UserRole,
  ) {
    setRole(value);

    resetPage();
  }

  // ============================================================
  // SORT
  // ============================================================

  function handleSort(
    value:
      | "newest"
      | "oldest"
      | "name_asc"
      | "name_desc",
  ) {
    setSort(value);

    resetPage();
  }

  // ============================================================
  // BAN / UNBAN
  // ============================================================

  async function handleToggleBan(
    user: AdminUser,
  ) {
    const action =
      user.isBanned
        ? "unban"
        : "ban";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${user.email}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await updateUserMutation.mutateAsync(
        {
          id: user.id,

          data: {
            isBanned:
              !user.isBanned,
          },
        },
      );
    } catch {
      // Mutation error is displayed
      // by the UI.
    }
  }

  // ============================================================
  // CHANGE ROLE
  // ============================================================

  async function handleChangeRole(
    user: AdminUser,
    newRole: UserRole,
  ) {
    if (!isSuperAdmin) {
      return;
    }

    if (
      user.role ===
      "super_admin"
    ) {
      window.alert(
        "Super admin accounts cannot be modified.",
      );

      return;
    }

    if (
      user.role === newRole
    ) {
      return;
    }

    if (
      newRole ===
      "super_admin"
    ) {
      window.alert(
        "A super admin cannot be created from this page.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Change ${user.email}'s role from ${user.role.replace(
          "_",
          " ",
        )} to ${newRole.replace(
          "_",
          " ",
        )}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await updateUserMutation.mutateAsync(
        {
          id: user.id,

          data: {
            role:
              newRole ===
              "admin"
                ? "admin"
                : "customer",
          },
        },
      );
    } catch {
      // Mutation error is displayed
      // by the UI.
    }
  }

  // ============================================================
  // CURRENT USER LOADING
  // ============================================================

  if (
    isCurrentUserLoading
  ) {
    return (
      <section className="space-y-6">
        <PageHeader />

        <LoadingCard text="Loading your account permissions..." />
      </section>
    );
  }

  // ============================================================
  // CURRENT USER ERROR
  // ============================================================

  if (
    isCurrentUserError ||
    !currentUser
  ) {
    return (
      <section className="space-y-6">
        <PageHeader />

        <ErrorCard
          title="Unable to determine your admin permissions."
          message="Please refresh the page and try again."
        />
      </section>
    );
  }

  // ============================================================
  // CUSTOMER LOADING
  // ============================================================

  if (
    isLoading &&
    !data
  ) {
    return (
      <section className="space-y-6">
        <PageHeader />

        <CustomerFilters
          search={search}
          status={status}
          role={role}
          sort={sort}
          onSearchChange={
            handleSearch
          }
          onStatusChange={
            handleStatus
          }
          onRoleChange={
            handleRole
          }
          onSortChange={
            handleSort
          }
        />

        <LoadingCard text="Loading customers..." />
      </section>
    );
  }

  // ============================================================
  // CUSTOMER ERROR
  // ============================================================

  if (
    isError &&
    !data
  ) {
    return (
      <section className="space-y-6">
        <PageHeader />

        <CustomerFilters
          search={search}
          status={status}
          role={role}
          sort={sort}
          onSearchChange={
            handleSearch
          }
          onStatusChange={
            handleStatus
          }
          onRoleChange={
            handleRole
          }
          onSortChange={
            handleSort
          }
        />

        <ErrorCard
          title="Failed to load customers."
          message={
            error instanceof Error
              ? error.message
              : "Something went wrong."
          }
        />
      </section>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <section className="space-y-6">
      <PageHeader />

      {/* CURRENT ROLE */}

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-700">
          Signed in as{" "}
          <span className="font-semibold capitalize">
            {currentUser.role.replace(
              "_",
              " ",
            )}
          </span>
        </p>
      </div>

      {/* MUTATION ERROR */}

      {updateUserMutation.isError && (
        <ErrorCard
          title="Customer update failed."
          message={
            updateUserMutation.error instanceof
            Error
              ? updateUserMutation.error.message
              : "Failed to update customer."
          }
        />
      )}

      {/* FILTERS */}

      <CustomerFilters
        search={search}
        status={status}
        role={role}
        sort={sort}
        onSearchChange={
          handleSearch
        }
        onStatusChange={
          handleStatus
        }
        onRoleChange={
          handleRole
        }
        onSortChange={
          handleSort
        }
      />

      {/* FETCHING INDICATOR */}

      {isFetching && (
        <div className="text-right text-xs text-slate-400">
          Updating results...
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Users"
          value={
            pagination?.total ??
            0
          }
        />

        <SummaryCard
          label="Showing"
          value={users.length}
        />

        <SummaryCard
          label="Current Page"
          value={
            pagination?.page ??
            1
          }
        />
      </div>

      {/* TABLE */}

      <CustomerTable
        users={users}
        isSuperAdmin={
          isSuperAdmin
        }
        onToggleBan={
          handleToggleBan
        }
        onChangeRole={
          handleChangeRole
        }
        updatingUserId={
          updateUserMutation.isPending
            ? updateUserMutation
                .variables?.id
            : undefined
        }
      />

      {/* PAGINATION */}

      {pagination &&
        pagination.totalPages >
          1 && (
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Page{" "}
                {pagination.page}{" "}
                of{" "}
                {
                  pagination.totalPages
                }
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {pagination.total}{" "}
                total users
              </p>
            </div>

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
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
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
                className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
    </section>
  );
}

// ============================================================
// PAGE HEADER
// ============================================================

function PageHeader() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <Users className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your store
            customers and users.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// LOADING CARD
// ============================================================

function LoadingCard({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

      <p className="mt-3 text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}

// ============================================================
// ERROR CARD
// ============================================================

function ErrorCard({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="text-sm font-semibold text-red-700">
        {title}
      </p>

      <p className="mt-1 text-sm text-red-600">
        {message}
      </p>
    </div>
  );
}