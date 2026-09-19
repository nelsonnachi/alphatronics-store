"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  ShoppingBag,
  Ban,
  UserCheck,
  MapPin,
  Shield,
} from "lucide-react";
import { useAdminUser, useUpdateAdminUser } from "@/lib/query/users/user-hooks";

function formatPrice(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
    },
  ).format(new Date(value));
}

function getFullName(
  firstName: string | null,
  lastName: string | null,
  email: string,
) {
  return [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ") ||
    "Unnamed customer";
}

function getInitials(
  firstName: string | null,
  lastName: string | null,
  email: string,
) {
  const initials = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .map((name) =>
      name!.charAt(0).toUpperCase(),
    )
    .join("");

  return (
    initials ||
    email.charAt(0).toUpperCase()
  );
}

type CustomerDetailsPageProps = {
  id: string;
};

export function CustomerDetailsPage({
  id,
}: CustomerDetailsPageProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useAdminUser(id);

  const updateUserMutation =
    useUpdateAdminUser();

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <section className="space-y-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading customer...
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    isError ||
    !data
  ) {
    return (
      <section className="space-y-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">
            Failed to load
            customer.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error instanceof
            Error
              ? error.message
              : "Customer not found."}
          </p>
        </div>
      </section>
    );
  }

  const {
    customer,
    addresses,
    orders,
  } = data.data;

  const fullName =
    getFullName(
      customer.firstName,
      customer.lastName,
      customer.email,
    );

  const initials =
    getInitials(
      customer.firstName,
      customer.lastName,
      customer.email,
    );

  // ============================================================
  // BAN / UNBAN
  // ============================================================

  async function toggleBan() {
    const nextBanned =
      !customer.isBanned;

    const confirmed =
      window.confirm(
        `Are you sure you want to ${
          nextBanned
            ? "ban"
            : "unban"
        } this customer?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await updateUserMutation.mutateAsync(
        {
          id: customer.id,

          data: {
            isBanned:
              nextBanned,
          },
        },
      );
    } catch {
      // Error is displayed below.
    }
  }

  return (
    <section className="space-y-6">

      {/* ======================================================
          BACK
      ======================================================= */}

      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customers
      </Link>

      {/* ======================================================
          MUTATION ERROR
      ======================================================= */}

      {updateUserMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Failed to update
            customer.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {updateUserMutation.error instanceof
            Error
              ? updateUserMutation
                  .error.message
              : "Something went wrong."}
          </p>
        </div>
      )}

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50">
              {customer.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    customer.imageUrl
                  }
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-blue-600">
                  {initials}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#0B1F3B]">
                {fullName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {customer.email}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-600">
                  {customer.role.replace(
                    "_",
                    " ",
                  )}
                </span>

                {customer.isBanned ? (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                    Banned
                  </span>
                ) : (
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BAN BUTTON */}

          {customer.role !==
            "super_admin" && (
            <button
              type="button"
              onClick={
                toggleBan
              }
              disabled={
                updateUserMutation.isPending
              }
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                customer.isBanned
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {customer.isBanned ? (
                <UserCheck className="h-4 w-4" />
              ) : (
                <Ban className="h-4 w-4" />
              )}

              {updateUserMutation.isPending
                ? "Updating..."
                : customer.isBanned
                  ? "Unban Customer"
                  : "Ban Customer"}
            </button>
          )}
        </div>
      </div>

      {/* ======================================================
          SUMMARY CARDS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          icon={
            <ShoppingBag className="h-5 w-5" />
          }
          label="Total Orders"
          value={
            orders.totalOrders
          }
        />

        <SummaryCard
          icon={
            <span className="text-base font-bold">
              ₦
            </span>
          }
          label="Total Spent"
          value={formatPrice(
            orders.totalSpent,
          )}
        />

        <SummaryCard
          icon={
            <Shield className="h-5 w-5" />
          }
          label="Account Role"
          value={customer.role.replace(
            "_",
            " ",
          )}
        />

        <SummaryCard
          icon={
            <CalendarDays className="h-5 w-5" />
          }
          label="Joined"
          value={formatDate(
            customer.createdAt,
          )}
        />
      </div>

      {/* ======================================================
          CUSTOMER INFORMATION
      ======================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* CONTACT */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Contact Information
          </h2>

          <div className="mt-4 space-y-4">

            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-slate-400" />

              <div>
                <p className="text-xs text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm text-slate-700">
                  {customer.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-slate-400" />

              <div>
                <p className="text-xs text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {customer.phone ??
                    "No phone number"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />

              <div>
                <p className="text-xs text-slate-400">
                  Joined
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(
                    customer.createdAt,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACCOUNT */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Account
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400">
                Role
              </p>

              <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                {customer.role.replace(
                  "_",
                  " ",
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Status
              </p>

              <p
                className={`mt-1 text-sm font-medium ${
                  customer.isBanned
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {customer.isBanned
                  ? "Banned"
                  : "Active"}
              </p>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Order Summary
          </h2>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Total orders
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {orders.totalOrders}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Total spent
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {formatPrice(
                  orders.totalSpent,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          ADDRESSES
      ======================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />

          <h2 className="text-sm font-semibold text-slate-900">
            Addresses
          </h2>
        </div>

        {addresses.length ===
        0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No saved addresses.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {addresses.map(
              (address) => (
                <div
                  key={
                    address.id
                  }
                  className="rounded-lg border border-slate-200 p-4"
                >
                  {address.isDefault && (
                    <span className="mb-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600">
                      Default
                    </span>
                  )}

                  <p className="text-sm font-medium text-slate-800">
                    {
                      address.firstName
                    }{" "}
                    {
                      address.lastName
                    }
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {
                      address.addressLine1
                    }

                    {address.addressLine2
                      ? `, ${address.addressLine2}`
                      : ""}

                    {address.city
                      ? `, ${address.city}`
                      : ""}

                    {address.state
                      ? `, ${address.state}`
                      : ""}

                    {address.postalCode
                      ? `, ${address.postalCode}`
                      : ""}

                    {address.country
                      ? `, ${address.country}`
                      : ""}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          RECENT ORDERS
      ======================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Orders
          </h2>
        </div>

        {orders.recent.length ===
        0 ? (
          <div className="p-10 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-2 text-sm text-slate-500">
              This customer
              has no orders
              yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.recent.map(
              (order) => (
                <div
                  key={
                    order.id
                  }
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {
                        order.orderNumber
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(
                        order.placedAt,
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">
                      {order.status.replace(
                        /_/g,
                        " ",
                      )}
                    </span>

                    <span className="text-sm font-semibold text-slate-800">
                      {formatPrice(
                        Number(
                          order.total,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;

  label: string;

  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}