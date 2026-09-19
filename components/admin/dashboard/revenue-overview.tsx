"use client";

import { ChevronDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  AdminDashboardData,
  DashboardRange,
} from "@/lib/query/dashboard/admin-dashboard-types";

type RevenueOverviewProps = {
  data: AdminDashboardData;
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
};

const periods: {
  label: string;
  value: DashboardRange;
}[] = [
  {
    label: "Today",
    value: "today",
  },
  {
    label: "Last 7 days",
    value: "7d",
  },
  {
    label: "Last 30 days",
    value: "30d",
  },
  {
    label: "Last 90 days",
    value: "90d",
  },
];

function formatDate(date: string) {
  const value = new Date(date);

  return value.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

function formatRevenue(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatYAxis(value: number) {
  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `₦${Math.round(value / 1_000)}k`;
  }

  return `₦${value}`;
}

export function RevenueOverview({
  data,
  range,
  onRangeChange,
}: RevenueOverviewProps) {
  const trend = data.revenue.trend;

  const chartData = trend.map((item) => ({
    date: formatDate(item.date),
    revenue: item.revenue,
  }));

  return (
    <div className="rounded-[14px] border border-[#e7eaf1] bg-white p-5 sm:p-[22px]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-[#0f172a]">
          Revenue Overview
        </h3>

        <div className="relative">
          <select
            value={range}
            onChange={(event) =>
              onRangeChange(event.target.value as DashboardRange)
            }
            className="appearance-none rounded-lg border border-[#e7eaf1] bg-white py-1.5 pl-3 pr-8 text-xs text-[#5b6472] outline-none focus:border-[#2f5fe0]"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8993a4]" />
        </div>
      </div>

      {/* Revenue summary */}
      <div className="mb-3.5 flex items-center gap-[18px]">
        <div className="flex items-center gap-1.5 text-xs text-[#5b6472]">
          <span className="h-[9px] w-[9px] rounded-[3px] bg-[#2f5fe0]" />
          Revenue
        </div>

        <div className="text-xs font-semibold text-[#0f172a]">
          {formatRevenue(data.revenue.total)}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[#8993a4]">
            No revenue data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                stroke="#e7eaf1"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 10,
                  fill: "#8993a4",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 10,
                  fill: "#8993a4",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
              />

              <Tooltip
                formatter={(value) =>
                  formatRevenue(Number(value))
                }
                labelStyle={{
                  color: "#0f172a",
                }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e7eaf1",
                  fontSize: "12px",
                }}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2f5fe0"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue information */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#e7eaf1] pt-3">
        <div>
          <div className="text-[11px] text-[#8993a4]">
            Average Order Value
          </div>

          <div className="mt-0.5 text-[13px] font-bold text-[#0f172a]">
            {formatRevenue(data.revenue.averageOrderValue)}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-[#8993a4]">
            Orders
          </div>

          <div className="mt-0.5 text-[13px] font-bold text-[#0f172a]">
            {data.revenue.orderCount.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-[#8993a4]">
            Previous Period
          </div>

          <div
            className={`mt-0.5 text-[13px] font-bold ${
              data.revenue.changeVsPreviousPeriod !== null &&
              data.revenue.changeVsPreviousPeriod >= 0
                ? "text-[#17a266]"
                : "text-[#e0533f]"
            }`}
          >
            {data.revenue.changeVsPreviousPeriod === null
              ? "N/A"
              : `${
                  data.revenue.changeVsPreviousPeriod > 0
                    ? "+"
                    : ""
                }${data.revenue.changeVsPreviousPeriod}%`}
          </div>
        </div>
      </div>
    </div>
  );
}