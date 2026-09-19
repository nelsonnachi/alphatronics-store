import { AdminPaymentStatus } from "@/lib/query/payments/admin-payments-types";


type PaymentStatusBadgeProps = {
  status: AdminPaymentStatus;
};

export function PaymentStatusBadge({
  status,
}: PaymentStatusBadgeProps) {
  const styles: Record<
    AdminPaymentStatus,
    string
  > = {
    pending:
      "bg-amber-50 text-amber-700 border-amber-200",

    paid:
      "bg-green-50 text-green-700 border-green-200",

    failed:
      "bg-red-50 text-red-700 border-red-200",

    partially_refunded:
      "bg-blue-50 text-blue-700 border-blue-200",

    refunded:
      "bg-slate-100 text-slate-700 border-slate-200",
  };

  const labels: Record<
    AdminPaymentStatus,
    string
  > = {
    pending: "Pending",

    paid: "Paid",

    failed: "Failed",

    partially_refunded:
      "Partially refunded",

    refunded: "Refunded",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}