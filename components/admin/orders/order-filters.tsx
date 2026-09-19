"use client";

import type {
  OrderStatus,
} from "@/lib/query/orders/order-types";

type OrderFiltersProps = {
  status:
    | "all"
    | OrderStatus;

  onStatusChange: (
    value:
      | "all"
      | OrderStatus,
  ) => void;
};

export function OrderFilters({
  status,
  onStatusChange,
}: OrderFiltersProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Orders
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Filter orders by fulfillment status.
          </p>
        </div>

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as
                | "all"
                | OrderStatus,
            )
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">
            All Orders
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="shipped">
            Shipped
          </option>

          <option value="out_for_delivery">
            Out for delivery
          </option>

          <option value="delivered">
            Delivered
          </option>

          <option value="cancelled">
            Cancelled
          </option>

          <option value="refunded">
            Refunded
          </option>

          <option value="failed">
            Failed
          </option>
        </select>
      </div>
    </div>
  );
}