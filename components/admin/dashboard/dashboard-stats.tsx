"use client";

import {
  CircleDollarSign,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

import type { AdminDashboardData } from "@/lib/query/dashboard/admin-dashboard-types";

type DashboardStatsProps = {
  data: AdminDashboardData;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatChange(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${Math.abs(value).toFixed(1)}%`;
}

export function DashboardStats({
  data,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(
        data.overview.totalRevenue,
      ),
      description: "today",
      change:
        data.revenue.changeVsPreviousPeriod,
      icon: CircleDollarSign,
      iconClass:
        "bg-[#eef2fe] text-[#2f5fe0]",
    },

    {
      label: "Orders Placed",
      value: formatNumber(
        data.overview.newOrders,
      ),
      description: "today",
      change:
        data.revenue
          .orderCountChangeVsPreviousPeriod,
      icon: ShoppingBag,
      iconClass:
        "bg-[#e8f8f0] text-[#17a266]",
    },

    {
      label: "Active Products",
      value: formatNumber(
        data.overview.totalInventoryProducts,
      ),
      description: "currently active",
      change: null,
      icon: Package,
      iconClass:
        "bg-[#fbf1e3] text-[#e08a1f]",
    },

    {
      label: "Registered Customers",
      value: formatNumber(
        data.overview.totalUsers,
      ),
      description: "total customers",
      change:
        data.customers.changeVsPreviousPeriod,
      icon: Users,
      iconClass:
        "bg-[#fbeae7] text-[#e0533f]",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
      {stats.map((stat) => {
        const Icon = stat.icon;

        const changeIsDown =
          stat.change !== null &&
          stat.change < 0;

        return (
          <div
            key={stat.label}
            className="rounded-[14px] border border-[#e7eaf1] bg-white p-[18px] sm:p-5"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${stat.iconClass}`}
              >
                <Icon className="h-[19px] w-[19px]" />
              </div>

              {stat.change !== null && (
                <span
                  className={`
                    rounded-full px-2 py-[3px]
                    text-[11.5px] font-bold
                    ${
                      changeIsDown
                        ? "bg-[#fbeae7] text-[#e0533f]"
                        : "bg-[#e8f8f0] text-[#17a266]"
                    }
                  `}
                >
                  {changeIsDown
                    ? "▼"
                    : "▲"}{" "}
                  {formatChange(stat.change)}
                </span>
              )}
            </div>

            <div className="mt-3 text-[24px] font-extrabold tracking-[-0.01em] text-[#0f172a]">
              {stat.value}
            </div>

            <div className="mt-1 text-[12.5px] text-[#5b6472]">
              {stat.label} ·{" "}
              {stat.description}
            </div>
          </div>
        );
      })}
    </section>
  );
}