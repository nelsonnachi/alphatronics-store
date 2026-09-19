import type {
  AdminOrder,
} from "@/lib/query/orders/order-types";

type OrderStatusBadgeProps = {
  status: AdminOrder["status"];
};

export function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium capitalize text-amber-700">
          Pending
        </span>
      );

    case "processing":
      return (
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-600">
          Processing
        </span>
      );

    case "shipped":
      return (
        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
          Shipped
        </span>
      );

    case "out_for_delivery":
      return (
        <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-600">
          Out for delivery
        </span>
      );

    case "delivered":
      return (
        <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
          Delivered
        </span>
      );

    case "cancelled":
      return (
        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
          Cancelled
        </span>
      );

    case "refunded":
      return (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          Refunded
        </span>
      );

    case "failed":
      return (
        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
          Failed
        </span>
      );

    default:
      return null;
  }
}