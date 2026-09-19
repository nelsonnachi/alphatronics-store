import Link from "next/link";
import { AdminPayment } from "@/lib/query/payments/admin-payments-types";
import { PaymentStatusBadge } from "./payment-status-badge";

type PaymentsTableProps = {
  payments: AdminPayment[];

  isLoading: boolean;
};

function formatMoney(amount: string, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function PaymentsTable({ payments, isLoading }: PaymentsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reference
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Provider
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
            </tr>
          </thead>

          {/* =================================================
              TABLE BODY
          ================================================= */}

          <tbody>
            {/* =================================================
                LOADING
            ================================================= */}

            {isLoading &&
              Array.from({
                length: 6,
              }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td colSpan={7} className="px-5 py-4">
                    <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!isLoading && payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <h3 className="text-sm font-semibold text-slate-800">
                      No payments found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      There are no payments matching your current filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* =================================================
                PAYMENTS
            ================================================= */}

            {!isLoading &&
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                >
                  {/* ORDER */}

                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="text-sm font-medium text-[#2563EB] hover:underline"
                    >
                      {payment.orderNumber ?? "View payment"}
                    </Link>
                  </td>

                  {/* CUSTOMER */}

                  <td className="px-5 py-4">
                    <div className="max-w-[220px] truncate text-sm text-slate-600">
                      {payment.customerEmail ?? "—"}
                    </div>
                  </td>

                  {/* REFERENCE */}

                  <td className="px-5 py-4">
                    <div className="max-w-[220px] truncate font-mono text-xs text-slate-500">
                      {payment.reference ?? "—"}
                    </div>
                  </td>

                  {/* PROVIDER */}

                  <td className="px-5 py-4">
                    <span className="text-sm font-medium capitalize text-slate-700">
                      {payment.provider}
                    </span>
                  </td>

                  {/* AMOUNT */}

                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-[#0B1F3B]">
                      {formatMoney(payment.amount, payment.currency)}
                    </div>

                    {Number(payment.refundedAmount) > 0 && (
                      <div className="mt-1 text-xs text-slate-500">
                        Refunded:{" "}
                        {formatMoney(payment.refundedAmount, payment.currency)}
                      </div>
                    )}
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <PaymentStatusBadge status={payment.status} />
                  </td>

                  {/* DATE */}

                  <td className="px-5 py-4">
                    <div className="text-sm text-slate-600">
                      {formatDate(payment.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
