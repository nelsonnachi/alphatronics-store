import type {
  AdminDashboardData,
} from "@/lib/query/dashboard/admin-dashboard-types";

import type {
  OrderStatus as OrderStatusType,
} from "@/lib/query/orders/order-types";

type OrderStatusProps = {
  data: AdminDashboardData["orders"];
};

const statusStyles: Record<
  OrderStatusType,
  {
    label: string;
    color: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "#e08a1f",
  },

  processing: {
    label: "Processing",
    color: "#2f5fe0",
  },

  shipped: {
    label: "Shipped",
    color: "#8b5cf6",
  },

  out_for_delivery: {
    label: "Out for Delivery",
    color: "#06b6d4",
  },

  delivered: {
    label: "Delivered",
    color: "#17a266",
  },

  cancelled: {
    label: "Cancelled",
    color: "#e0533f",
  },

  refunded: {
    label: "Refunded",
    color: "#64748b",
  },

  failed: {
    label: "Failed",
    color: "#dc2626",
  },
};

function formatStatusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export function OrderStatus({
  data,
}: OrderStatusProps) {
  const statusBreakdown =
    data.statusBreakdown;

  /*
   * This should be the total number of
   * orders represented by the breakdown.
   */
  const totalOrders = data.total;

  const statuses = Object.entries(
    statusBreakdown,
  )
    .filter(([, count]) => count > 0)
    .map(([status, count]) => {
      const percentage =
        totalOrders > 0
          ? Math.round(
              (count / totalOrders) * 100,
            )
          : 0;

      /*
       * The API should normally only return
       * valid OrderStatus values.
       *
       * We still keep a fallback for safety.
       */
      const config =
        statusStyles[
          status as OrderStatusType
        ];

      return {
        status,
        label:
          config?.label ??
          formatStatusLabel(status),
        count,
        percentage,
        color:
          config?.color ??
          "#94a3b8",
      };
    });

  /*
   * Build the donut chart gradient.
   */
  let currentPercentage = 0;

  const gradientParts: string[] = [];

  for (const status of statuses) {
    const start = currentPercentage;

    const end =
      currentPercentage +
      status.percentage;

    gradientParts.push(
      `${status.color} ${start}% ${end}%`,
    );

    currentPercentage = end;
  }

  const donutBackground =
    statuses.length > 0
      ? `conic-gradient(${gradientParts.join(", ")})`
      : "#e7eaf1";

  return (
    <div className="rounded-[14px] border border-[#e7eaf1] bg-white p-5 sm:p-[22px]">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-[#0f172a]">
          Order Status
        </h3>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-[22px]">
        {/* Donut */}
        <div className="relative h-[132px] w-[132px] shrink-0">
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                donutBackground,
            }}
          />

          {/* Hole */}
          <div className="absolute inset-[20px] rounded-full bg-white" />

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[17px] font-extrabold text-[#0f172a]">
              {totalOrders.toLocaleString()}
            </div>

            <div className="text-[9.5px] text-[#5b6472]">
              ORDERS
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2.5">
          {statuses.length === 0 ? (
            <div className="text-center text-xs text-[#8993a4]">
              No order data for this period.
            </div>
          ) : (
            statuses.map((status) => (
              <div
                key={status.status}
                className="flex items-center gap-2.5 text-[12.5px]"
              >
                {/* Color */}
                <span
                  className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
                  style={{
                    backgroundColor:
                      status.color,
                  }}
                />

                {/* Status */}
                <span className="text-[#0f172a]">
                  {status.label}
                </span>

                {/* Count */}
                <span className="ml-auto text-[#5b6472]">
                  {status.count}
                </span>

                {/* Percentage */}
                <span className="w-[35px] text-right font-bold text-[#0f172a]">
                  {status.percentage}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}