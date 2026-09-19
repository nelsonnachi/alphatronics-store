"use client";

import { useAdminPayment } from "@/lib/query/payments/admin-payments-hooks";
import Link from "next/link";
import { PaymentStatusBadge } from "../payment-status-badge";

type AdminPaymentDetailPageProps = {
  paymentId: string;
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

function getCustomerName(
  customer: {
    firstName: string | null;
    lastName: string | null;
  } | null,
) {
  if (!customer) {
    return "Guest customer";
  }

  const name = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Customer";
}

export function AdminPaymentDetailPage({
  paymentId,
}: AdminPaymentDetailPageProps) {
  const { data, isLoading, isError, error } = useAdminPayment(paymentId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-100" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />

          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="h-80 animate-pulse rounded-xl bg-slate-100" />

        <div className="h-80 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/payments"
          className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
        >
          ← Back to payments
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">
            Unable to load payment
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Something went wrong while loading this payment."}
          </p>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/payments"
          className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
        >
          ← Back to payments
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h1 className="text-lg font-semibold text-slate-800">
            Payment not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The payment you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  const { payment, order, customer, items, refunds } = data.data;

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/payments"
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            ← Back to payments
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#0B1F3B]">
              Payment details
            </h1>

            <PaymentStatusBadge status={payment.status} />
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Payment for order{" "}
            <span className="font-medium text-slate-700">
              #{order.orderNumber}
            </span>
          </p>
        </div>
      </div>

      {/* PAYMENT + CUSTOMER */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* PAYMENT SUMMARY */}

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-[#0B1F3B]">Payment summary</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Amount
              </p>

              <p className="mt-1 text-xl font-bold text-[#0B1F3B]">
                {formatMoney(payment.amount, payment.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Provider
              </p>

              <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                {payment.provider}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Reference
              </p>

              <p className="mt-1 break-all font-mono text-xs text-slate-600">
                {payment.reference ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Payment ID
              </p>

              <p className="mt-1 break-all font-mono text-xs text-slate-600">
                {payment.id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Paid at
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {formatDate(payment.paidAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {formatDate(payment.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Refunded
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {formatMoney(payment.refundedAmount, payment.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Refunded at
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {formatDate(payment.refundedAt)}
              </p>
            </div>
          </div>
        </section>

        {/* CUSTOMER */}

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-[#0B1F3B]">Customer</h2>
          </div>

          <div className="p-6">
            {customer ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getCustomerName(customer)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-700">
                    {customer.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Customer ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-slate-500">
                    {customer.id}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Customer information is not available.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ORDER INFORMATION */}

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-[#0B1F3B]">
                Order information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Order #{order.orderNumber}
              </p>
            </div>

            <Link
              href={`/admin/orders/${order.id}`}
              className="text-sm font-medium text-[#2563EB] hover:underline"
            >
              View order
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 p-6 md:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Subtotal
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {formatMoney(order.subtotal, order.currency)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Shipping
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {formatMoney(order.shippingFee, order.currency)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Tax
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {formatMoney(order.tax, order.currency)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Discount
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {formatMoney(order.discount, order.currency)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total
            </p>

            <p className="mt-1 text-lg font-bold text-[#0B1F3B]">
              {formatMoney(order.total, order.currency)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Order status
            </p>

            <p className="mt-1 text-sm font-medium capitalize text-slate-700">
              {order.status.replaceAll("_", " ")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Payment status
            </p>

            <p className="mt-1 text-sm font-medium capitalize text-slate-700">
              {order.paymentStatus.replaceAll("_", " ")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Order date
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </section>

      {/* ORDER ITEMS */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-[#0B1F3B]">Order items</h2>

          <p className="mt-1 text-sm text-slate-500">
            Products included in this payment.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unit price
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No order items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {item.productName}
                      </p>

                      {item.variantId && (
                        <p className="mt-1 text-xs text-slate-400">
                          Variant selected
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.quantity}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatMoney(item.unitPrice, order.currency)}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {formatMoney(item.totalPrice, order.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* REFUND HISTORY */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-[#0B1F3B]">Refund history</h2>

          <p className="mt-1 text-sm text-slate-500">
            Refunds associated with this payment.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Provider reference
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No refunds yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Refunds for this payment will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => (
                  <tr
                    key={refund.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {formatMoney(refund.amount, refund.currency)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                        {refund.status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500">
                        {refund.providerRefundId ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {refund.reason ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(refund.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
