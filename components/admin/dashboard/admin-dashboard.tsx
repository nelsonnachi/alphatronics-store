"use client";

import { useAdminDashboard } from "@/lib/query/dashboard/admin-dashboard-hooks";
import type { DashboardRange } from "@/lib/query/dashboard/admin-dashboard-types";

import { DashboardStats } from "./dashboard-stats";
import { DashboardCharts } from "./dashboard-charts";
import { LowStockAlerts } from "./low-stock-alerts";
import { TopSellingProducts } from "./top-selling-products";
import { RecentOrders } from "./recent-orders";

export function AdminDashboard() {
  const range: DashboardRange = "today";

  const {
    data,
    isLoading,
    isError,
  } = useAdminDashboard(range);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError || !data?.data) {
    return (
      <section className="rounded-[14px] border border-[#e7eaf1] bg-white p-5">
        <p className="text-sm text-[#e0533f]">
          Failed to load dashboard.
        </p>
      </section>
    );
  }

  const dashboard = data.data;

  return (
    <div className="space-y-[18px]">
      {/* Statistics */}
      <DashboardStats data={dashboard} />

      {/* Revenue + Order Status */}
      <DashboardCharts data={dashboard} />

      {/* Inventory + Best Sellers */}
      <section className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <LowStockAlerts data={dashboard.inventory} />

        <TopSellingProducts
          products={dashboard.bestSellers}
        />
      </section>

      {/* Recent Orders */}
      <RecentOrders
        orders={dashboard.recentOrders}
      />
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-[18px]">
      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[150px] animate-pulse rounded-[14px] border border-[#e7eaf1] bg-white"
          />
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-[18px] xl:grid-cols-[1.6fr_1fr]">
        <div className="h-[350px] animate-pulse rounded-[14px] border border-[#e7eaf1] bg-white" />

        <div className="h-[350px] animate-pulse rounded-[14px] border border-[#e7eaf1] bg-white" />
      </section>

      {/* Inventory + Best Sellers */}
      <section className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <div className="h-[350px] animate-pulse rounded-[14px] border border-[#e7eaf1] bg-white" />

        <div className="h-[350px] animate-pulse rounded-[14px] border border-[#e7eaf1] bg-white" />
      </section>

      {/* Recent Orders */}
      <div className="h-[350px] animate-pulse rounded-[14px] border border-[#e7eaf1] bg-white" />
    </div>
  );
}