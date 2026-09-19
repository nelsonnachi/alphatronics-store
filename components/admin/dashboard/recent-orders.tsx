"use client";

import Link from "next/link";

import type { DashboardRecentOrder } from "@/lib/query/dashboard/admin-dashboard-types";

type RecentOrdersProps = {
  orders: DashboardRecentOrder[];
};

function formatCurrency(
  value: string | number,
  currency: string,
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function getCustomerName(
  user: DashboardRecentOrder["user"],
) {
  if (!user) {
    return "Guest Customer";
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || user.email;
}

function getInitials(
  user: DashboardRecentOrder["user"],
) {
  if (!user) {
    return "GC";
  }

  const name = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  if (!name) {
    return user.email
      .slice(0, 2)
      .toUpperCase();
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const statusStyles: Record<
  string,
  string
> = {
  delivered:
    "bg-[#e8f8f0] text-[#17a266]",

  processing:
    "bg-[#eef2fe] text-[#2f5fe0]",

  pending:
    "bg-[#fbf1e3] text-[#e08a1f]",

  shipped:
    "bg-[#eef2fe] text-[#2f5fe0]",

  out_for_delivery:
    "bg-[#e0f7fa] text-[#06b6d4]",

  cancelled:
    "bg-[#fbeae7] text-[#e0533f]",

  refunded:
    "bg-[#f1f5f9] text-[#64748b]",

  failed:
    "bg-[#fee2e2] text-[#dc2626]",
};

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export function RecentOrders({
  orders,
}: RecentOrdersProps) {
  return (
    <section className="rounded-[14px] border border-[#e7eaf1] bg-white p-5 sm:p-[22px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-[#0f172a]">
          Recent Orders
        </h3>

        <Link
          href="/admin/orders"
          className="shrink-0 text-[12.5px] font-semibold text-[#2f5fe0] hover:underline"
        >
          View all orders →
        </Link>
      </div>

      {orders.length === 0 && (
        <div className="py-8 text-center text-sm text-[#8993a4]">
          No recent orders for today.
        </div>
      )}

      {orders.length > 0 && (
        <div className="-mx-5 overflow-x-auto sm:-mx-[22px]">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[#e7eaf1] px-3 pb-2.5 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-[#8993a4]">
                  Order
                </th>

                <th className="border-b border-[#e7eaf1] px-3 pb-2.5 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-[#8993a4]">
                  Customer
                </th>

                <th className="border-b border-[#e7eaf1] px-3 pb-2.5 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-[#8993a4]">
                  Total
                </th>

                <th className="border-b border-[#e7eaf1] px-3 pb-2.5 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-[#8993a4]">
                  Payment
                </th>

                <th className="border-b border-[#e7eaf1] px-3 pb-2.5 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-[#8993a4]">
                  Status
                </th>

                <th className="border-b border-[#e7eaf1] px-3 pb-2.5 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-[#8993a4]">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const customerName =
                  getCustomerName(
                    order.user,
                  );

                const initials =
                  getInitials(
                    order.user,
                  );

                const statusClass =
                  statusStyles[
                    order.status
                  ] ??
                  "bg-[#f1f5f9] text-[#64748b]";

                return (
                  <tr key={order.id}>
                    <td className="border-b border-[#e7eaf1] px-3 py-[13px] text-[13px] font-medium text-[#0f172a]">
                      {order.orderNumber}
                    </td>

                    <td className="border-b border-[#e7eaf1] px-3 py-[13px]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2fe] text-[11px] font-bold text-[#2f5fe0]">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-[12.5px] font-semibold text-[#0f172a]">
                            {customerName}
                          </div>

                          <div className="truncate text-[11px] text-[#8993a4]">
                            {order.user?.email ??
                              "Guest customer"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="border-b border-[#e7eaf1] px-3 py-[13px] text-[13px] font-semibold text-[#0f172a]">
                      {formatCurrency(
                        order.total,
                        order.currency,
                      )}
                    </td>

                    <td className="border-b border-[#e7eaf1] px-3 py-[13px] text-[13px] capitalize text-[#5b6472]">
                      {order.paymentStatus.replace(
                        /_/g,
                        " ",
                      )}
                    </td>

                    <td className="border-b border-[#e7eaf1] px-3 py-[13px]">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass}`}
                      >
                        {formatStatus(
                          order.status,
                        )}
                      </span>
                    </td>

                    <td className="border-b border-[#e7eaf1] px-3 py-[13px] text-[13px] text-[#5b6472]">
                      {formatDate(
                        order.placedAt,
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}