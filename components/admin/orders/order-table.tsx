"use client";

import Link from "next/link";

import {
  Eye,
} from "lucide-react";

import type {
  AdminOrder,
} from "@/lib/query/orders/order-types";

import { OrderStatusBadge } from "./order-status-badge";

type OrderTableProps = {
  orders: AdminOrder[];
};

function formatPrice(
  value: string,
  currency = "NGN",
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    },
  ).format(Number(value));
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function getCustomerName(
  order: AdminOrder,
) {
  if (!order.user) {
    return "Guest";
  }

  const name = [
    order.user.firstName,
    order.user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return name || order.user.email;
}

function getPaymentLabel(
  status: AdminOrder["paymentStatus"],
) {
  switch (status) {
    case "paid":
      return "Paid";

    case "pending":
      return "Pending";

    case "failed":
      return "Failed";

    case "refunded":
      return "Refunded";

    case "partially_refunded":
      return "Partially refunded";

    default:
      return status;
  }
}

export function OrderTable({
  orders,
}: OrderTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* ======================================================
          DESKTOP
      ======================================================= */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1150px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-16 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                S/N
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>

              <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map(
              (
                order,
                index,
              ) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* S/N */}

                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-400">
                      {index + 1}
                    </span>
                  </td>

                  {/* ORDER */}

                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {order.orderNumber}
                    </Link>

                    <p className="mt-1 text-xs text-slate-400">
                      {order.items.length}{" "}
                      {order.items.length ===
                      1
                        ? "item"
                        : "items"}
                    </p>
                  </td>

                  {/* CUSTOMER */}

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {getCustomerName(
                        order,
                      )}
                    </p>

                    <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                      {order.user?.email ??
                        "No email"}
                    </p>
                  </td>

                  {/* TOTAL */}

                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-slate-800">
                      {formatPrice(
                        order.total,
                        order.currency,
                      )}
                    </span>
                  </td>

                  {/* PAYMENT */}

                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm capitalize text-slate-700">
                        {order.paymentMethod.replace(
                          /_/g,
                          " ",
                        )}
                      </p>

                      <p
                        className={`mt-1 text-xs font-medium ${
                          order.paymentStatus ===
                          "paid"
                            ? "text-green-600"
                            : order.paymentStatus ===
                                "failed"
                              ? "text-red-600"
                              : "text-amber-600"
                        }`}
                      >
                        {getPaymentLabel(
                          order.paymentStatus,
                        )}
                      </p>
                    </div>
                  </td>

                  {/* STATUS */}

                  <td className="px-4 py-4">
                    <OrderStatusBadge
                      status={
                        order.status
                      }
                    />
                  </td>

                  {/* DATE */}

                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-500">
                      {formatDate(
                        order.placedAt,
                      )}
                    </span>
                  </td>

                  {/* ACTION */}

                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        title="View order"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          MOBILE
      ======================================================= */}

      <div className="divide-y divide-slate-100 lg:hidden">
        {orders.map(
          (
            order,
            index,
          ) => (
            <div
              key={order.id}
              className="p-4"
            >
              <div className="flex items-start gap-3">
                <span className="pt-1 text-xs font-semibold text-slate-400">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm font-semibold text-blue-600"
                      >
                        {order.orderNumber}
                      </Link>

                      <p className="mt-1 text-xs text-slate-400">
                        {getCustomerName(
                          order,
                        )}
                      </p>
                    </div>

                    <OrderStatusBadge
                      status={
                        order.status
                      }
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-800">
                        {formatPrice(
                          order.total,
                          order.currency,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Payment
                      </p>

                      <p className="mt-1 text-xs font-medium capitalize text-slate-700">
                        {getPaymentLabel(
                          order.paymentStatus,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Items
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {order.items.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {formatDate(
                          order.placedAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" />
                    View Order
                  </Link>
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {/* EMPTY */}

      {orders.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            No orders found
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Try changing your order status filter.
          </p>
        </div>
      )}
    </div>
  );
}