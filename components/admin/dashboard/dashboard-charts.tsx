"use client";

import { useState } from "react";

import { RevenueOverview } from "./revenue-overview";
import { OrderStatus } from "./order-status";

import type {
  DashboardRange,
  AdminDashboardData,
} from "@/lib/query/dashboard/admin-dashboard-types";

import { useAdminDashboard } from "@/lib/query/dashboard/admin-dashboard-hooks";

type DashboardChartsProps = {
  data: AdminDashboardData;
};

export function DashboardCharts({
  data: initialData,
}: DashboardChartsProps) {
  const [range, setRange] =
    useState<DashboardRange>("today");

  const {
    data,
    isLoading,
    isError,
  } = useAdminDashboard(range);

  /*
   * When range is "today", we already have
   * the dashboard data from the parent.
   *
   * For other ranges, TanStack Query fetches
   * the requested dashboard range.
   */
  const dashboard =
    data?.data ??
    initialData;

  if (isLoading && range !== "today") {
    return (
      <section className="grid grid-cols-1 gap-[18px] xl:grid-cols-[1.6fr_1fr]">
        <div className="h-[350px] animate-pulse rounded-[14px] border border-[#e7eaf1] bg-white" />

        <div className="h-[350px] animate-pulse rounded-[14px] border border-[#e7eaf1] bg-white" />
      </section>
    );
  }

  if (isError && range !== "today") {
    return (
      <section className="rounded-[14px] border border-[#e7eaf1] bg-white p-5">
        <p className="text-sm text-[#e0533f]">
          Failed to load dashboard charts.
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-[18px] xl:grid-cols-[1.6fr_1fr]">
      <RevenueOverview
        data={dashboard}
        range={range}
        onRangeChange={setRange}
      />

      <OrderStatus
        data={dashboard.orders}
      />
    </section>
  );
}