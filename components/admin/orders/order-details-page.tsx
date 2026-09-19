"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Package,
  CreditCard,
  User,
  MapPin,
  Truck,
  RotateCcw,
} from "lucide-react";

import {
  useAdminOrder,
  useRefundOrder,
  useUpdateAdminOrder,
} from "@/lib/query/orders/admin-order-hooks";

import type {
  OrderStatus,
  UpdateAdminOrderInput,
  OrderAddress,
  OrderAddressSnapshot,
} from "@/lib/query/orders/order-types";

import { OrderStatusBadge } from "./order-status-badge";

// ============================================================
// PROPS
// ============================================================

type AdminOrderDetailsPageProps = {
  id: string;
};

// ============================================================
// ADDRESS CARD PROPS
// ============================================================

type AddressCardProps = {
  title: string;
  address: OrderAddress | null;
  snapshot: OrderAddressSnapshot | null;
};

// ============================================================
// HELPERS
// ============================================================

function formatPrice(
  value: string,
  currency = "NGN",
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(
  value: string | null | undefined,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

function getCustomerName(
  firstName: string | null,
  lastName: string | null,
  email: string,
) {
  const name = [firstName, lastName]
    .filter(Boolean)
    .join(" ");

  return name || email;
}

function getPaymentStatusClass(
  status: string,
) {
  if (status === "paid") {
    return "text-green-600";
  }

  if (status === "failed") {
    return "text-red-600";
  }

  if (
    status === "refunded" ||
    status === "partially_refunded"
  ) {
    return "text-purple-600";
  }

  return "text-amber-600";
}

// ============================================================
// ALLOWED STATUS TRANSITIONS
// ============================================================

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  pending: [
    "processing",
    "cancelled",
    "failed",
  ],

  processing: [
    "shipped",
    "cancelled",
    "failed",
  ],

  shipped: [
    "out_for_delivery",
  ],

  out_for_delivery: [
    "delivered",
  ],

  delivered: [],

  cancelled: [],

  refunded: [],

  failed: [],
};

// ============================================================
// PAGE
// ============================================================

export function AdminOrderDetailsPage({
  id,
}: AdminOrderDetailsPageProps) {
  // ============================================================
  // GET ORDER
  // ============================================================

  const {
    data,
    isLoading,
    isError,
    error,
  } = useAdminOrder(id);

  // ============================================================
  // MUTATIONS
  // ============================================================

  const updateOrderMutation =
    useUpdateAdminOrder();

  const refundOrderMutation =
    useRefundOrder();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [
    trackingNumber,
    setTrackingNumber,
  ] = useState("");

  const [
    carrier,
    setCarrier,
  ] = useState("");

  const [
    adminNote,
    setAdminNote,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<
    OrderStatus | ""
  >("");

  const [
    refundAmount,
    setRefundAmount,
  ] = useState("");

  const [
    refundReason,
    setRefundReason,
  ] = useState("");

  // ============================================================
  // ORDER DATA
  // ============================================================

  const order = data?.data;

  // ============================================================
  // SYNC SERVER DATA INTO FORM
  // ============================================================

  useEffect(() => {
    if (!order) {
      return;
    }

    setTrackingNumber(
      order.trackingNumber ?? "",
    );

    setCarrier(
      order.carrier ?? "",
    );

    setAdminNote(
      order.adminNote ?? "",
    );

    setSelectedStatus("");
  }, [
    order?.id,
    order?.trackingNumber,
    order?.carrier,
    order?.adminNote,
  ]);

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <section className="space-y-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading order...
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // ERROR / NOT FOUND
  // ============================================================

  if (isError || !order) {
    return (
      <section className="space-y-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">
            Failed to load order.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Order not found."}
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // IMPORTANT
  // ============================================================
  //
  // At this point TypeScript knows `order` exists.
  //
  // Keeping it in a new constant makes that guarantee available
  // inside the handler functions below as well.
  //
  // ============================================================

  const currentOrder = order;

  // ============================================================
  // CUSTOMER
  // ============================================================

  const customerName =
    currentOrder.user
      ? getCustomerName(
          currentOrder.user.firstName,
          currentOrder.user.lastName,
          currentOrder.user.email,
        )
      : "Customer";

  // ============================================================
  // NEXT STATUS OPTIONS
  // ============================================================

  const nextStatuses =
    allowedTransitions[
      currentOrder.status
    ];

  // ============================================================
  // REFUND AVAILABLE?
  // ============================================================

  const canRefund =
    currentOrder.paymentMethod !==
      "cash_on_delivery" &&
    (
      currentOrder.paymentStatus ===
        "paid" ||
      currentOrder.paymentStatus ===
        "partially_refunded"
    );

  // ============================================================
  // UPDATE ORDER
  // ============================================================

  async function handleUpdateOrder() {
    const payload: UpdateAdminOrderInput = {
      status:
        selectedStatus !== ""
          ? selectedStatus
          : currentOrder.status,
    };

    // ----------------------------------------------------------
    // TRACKING NUMBER
    // ----------------------------------------------------------

    if (
      trackingNumber !==
      (currentOrder.trackingNumber ??
        "")
    ) {
      payload.trackingNumber =
        trackingNumber;
    }

    // ----------------------------------------------------------
    // CARRIER
    // ----------------------------------------------------------

    if (
      carrier !==
      (currentOrder.carrier ?? "")
    ) {
      payload.carrier =
        carrier;
    }

    // ----------------------------------------------------------
    // ADMIN NOTE
    // ----------------------------------------------------------

    if (
      adminNote !==
      (currentOrder.adminNote ?? "")
    ) {
      payload.adminNote =
        adminNote;
    }

    // ----------------------------------------------------------
    // CHECK WHAT CHANGED
    // ----------------------------------------------------------

    const statusChanged =
      payload.status !==
      currentOrder.status;

    const trackingChanged =
      trackingNumber !==
      (currentOrder.trackingNumber ??
        "");

    const carrierChanged =
      carrier !==
      (currentOrder.carrier ?? "");

    const noteChanged =
      adminNote !==
      (currentOrder.adminNote ?? "");

    if (
      !statusChanged &&
      !trackingChanged &&
      !carrierChanged &&
      !noteChanged
    ) {
      window.alert(
        "There are no changes to save.",
      );

      return;
    }

    // ----------------------------------------------------------
    // SAVE
    // ----------------------------------------------------------

    try {
      await updateOrderMutation.mutateAsync(
        {
          id: currentOrder.id,

          data: payload,
        },
      );

      setSelectedStatus("");
    } catch {
      // React Query stores the error.
    }
  }

  // ============================================================
  // REFUND ORDER
  // ============================================================

  async function handleRefund() {
    const confirmed =
      window.confirm(
        "Are you sure you want to process this refund?",
      );

    if (!confirmed) {
      return;
    }

    const amount =
      refundAmount.trim() !== ""
        ? Number(refundAmount)
        : undefined;

    if (
      amount !== undefined &&
      (
        !Number.isFinite(amount) ||
        amount <= 0
      )
    ) {
      window.alert(
        "Please enter a valid refund amount.",
      );

      return;
    }

    try {
      await refundOrderMutation.mutateAsync(
        {
          id: currentOrder.id,

          data: {
            amount,

            reason:
              refundReason.trim() !== ""
                ? refundReason.trim()
                : undefined,
          },
        },
      );

      setRefundAmount("");
      setRefundReason("");
    } catch {
      // React Query stores the error.
    }
  }

  return (
    <section className="space-y-6">
      {/* ========================================================
          BACK
      ========================================================= */}

      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      {/* ========================================================
          HEADER
      ========================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-[#0B1F3B]">
                {currentOrder.orderNumber}
              </h1>

              <OrderStatusBadge
                status={
                  currentOrder.status
                }
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Placed{" "}
              {formatDate(
                currentOrder.placedAt,
              )}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Order Total
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatPrice(
                currentOrder.total,
                currentOrder.currency,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          MUTATION ERROR
      ========================================================= */}

      {(
        updateOrderMutation.isError ||
        refundOrderMutation.isError
      ) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {updateOrderMutation.error instanceof
            Error
              ? updateOrderMutation.error.message
              : refundOrderMutation.error instanceof
                  Error
                ? refundOrderMutation.error.message
                : "The order operation failed."}
          </p>
        </div>
      )}

      {/* ========================================================
          MAIN
      ========================================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* ======================================================
            LEFT
        ======================================================= */}

        <div className="space-y-6">
          {/* ORDER ITEMS */}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Order Items
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      currentOrder.items
                        .length
                    }{" "}
                    {currentOrder.items
                      .length === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {currentOrder.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-5"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.productName
                          }
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {
                          item.productName
                        }
                      </p>

                      {item.variantName && (
                        <p className="mt-1 text-xs text-slate-500">
                          {
                            item.variantName
                          }
                        </p>
                      )}

                      <p className="mt-1 font-mono text-[11px] text-slate-400">
                        SKU: {item.sku}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {item.quantity} ×{" "}
                        {formatPrice(
                          item.unitPrice,
                          currentOrder.currency,
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-800">
                        {formatPrice(
                          item.subtotal,
                          currentOrder.currency,
                        )}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* CUSTOMER */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <User className="h-5 w-5" />
              </div>

              <h2 className="text-sm font-semibold text-slate-900">
                Customer
              </h2>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-800">
                {customerName}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {currentOrder.user?.email ??
                  "No email"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {currentOrder.user?.phone ??
                  "No phone number"}
              </p>

              {currentOrder.user && (
                <Link
                  href={`/admin/customers/${currentOrder.user.id}`}
                  className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View customer
                </Link>
              )}
            </div>
          </div>

          {/* ADDRESSES */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AddressCard
              title="Shipping Address"
              address={
                currentOrder.shippingAddress
              }
              snapshot={
                currentOrder.addressSnapshots.find(
                  (snapshot) =>
                    snapshot.type ===
                    "shipping",
                ) ?? null
              }
            />

            <AddressCard
              title="Billing Address"
              address={
                currentOrder.billingAddress
              }
              snapshot={
                currentOrder.addressSnapshots.find(
                  (snapshot) =>
                    snapshot.type ===
                    "billing",
                ) ?? null
              }
            />
          </div>

          {/* CUSTOMER NOTE */}

          {currentOrder.customerNote && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Customer Note
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {
                  currentOrder.customerNote
                }
              </p>
            </div>
          )}
        </div>

        {/* ======================================================
            RIGHT
        ======================================================= */}

        <div className="space-y-6">
          {/* FULFILLMENT */}

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Truck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Fulfillment
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage shipping and order status.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Order Status
                </label>

                <select
                  value={
                    selectedStatus
                  }
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target
                        .value as
                        | OrderStatus
                        | "",
                    )
                  }
                  disabled={
                    nextStatuses.length ===
                    0
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm capitalize text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    {nextStatuses.length ===
                    0
                      ? "No status changes available"
                      : "Keep current status"}
                  </option>

                  {nextStatuses.map(
                    (
                      nextStatus,
                    ) => (
                      <option
                        key={
                          nextStatus
                        }
                        value={
                          nextStatus
                        }
                      >
                        {formatStatus(
                          nextStatus,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tracking Number
                </label>

                <input
                  value={
                    trackingNumber
                  }
                  onChange={(event) =>
                    setTrackingNumber(
                      event.target
                        .value,
                    )
                  }
                  maxLength={100}
                  placeholder="e.g. TRK123456"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Carrier
                </label>

                <input
                  value={
                    carrier
                  }
                  onChange={(event) =>
                    setCarrier(
                      event.target
                        .value,
                    )
                  }
                  maxLength={100}
                  placeholder="e.g. DHL"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Admin Note
                </label>

                <textarea
                  value={
                    adminNote
                  }
                  onChange={(event) =>
                    setAdminNote(
                      event.target
                        .value,
                    )
                  }
                  maxLength={1000}
                  rows={4}
                  placeholder="Internal note..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                onClick={
                  handleUpdateOrder
                }
                disabled={
                  updateOrderMutation.isPending
                }
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateOrderMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>

          {/* PAYMENT */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>

              <h2 className="text-sm font-semibold text-slate-900">
                Payment
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              <InfoRow
                label="Method"
                value={formatStatus(
                  currentOrder.paymentMethod,
                )}
              />

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span
                  className={`text-sm font-semibold capitalize ${getPaymentStatusClass(
                    currentOrder.paymentStatus,
                  )}`}
                >
                  {formatStatus(
                    currentOrder.paymentStatus,
                  )}
                </span>
              </div>

              <InfoRow
                label="Paid at"
                value={formatDate(
                  currentOrder.paidAt,
                )}
              />
            </div>
          </div>

          {/* ORDER SUMMARY */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3">
              <InfoRow
                label="Subtotal"
                value={formatPrice(
                  currentOrder.subtotal,
                  currentOrder.currency,
                )}
              />

              <InfoRow
                label="Shipping"
                value={formatPrice(
                  currentOrder.shippingCost,
                  currentOrder.currency,
                )}
              />

              <InfoRow
                label="Tax"
                value={formatPrice(
                  currentOrder.tax,
                  currentOrder.currency,
                )}
              />

              <InfoRow
                label="Discount"
                value={`-${formatPrice(
                  currentOrder.discount,
                  currentOrder.currency,
                )}`}
              />

              {currentOrder.coupon && (
                <InfoRow
                  label="Coupon"
                  value={
                    currentOrder.coupon
                      .code
                  }
                />
              )}

              <div className="border-t border-slate-200 pt-3">
                <InfoRow
                  label="Total"
                  value={formatPrice(
                    currentOrder.total,
                    currentOrder.currency,
                  )}
                  strong
                />
              </div>
            </div>
          </div>

          {/* SHIPPING */}

          {(
            currentOrder.trackingNumber ||
            currentOrder.carrier
          ) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Shipping
              </h2>

              <div className="mt-4 space-y-3">
                <InfoRow
                  label="Carrier"
                  value={
                    currentOrder.carrier ??
                    "—"
                  }
                />

                <InfoRow
                  label="Tracking"
                  value={
                    currentOrder.trackingNumber ??
                    "—"
                  }
                />

                <InfoRow
                  label="Shipped"
                  value={formatDate(
                    currentOrder.shippedAt,
                  )}
                />

                <InfoRow
                  label="Delivered"
                  value={formatDate(
                    currentOrder.deliveredAt,
                  )}
                />
              </div>
            </div>
          )}

          {/* REFUND */}

          {canRefund && (
            <div className="rounded-xl border border-red-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2 text-red-600">
                  <RotateCcw className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Refund
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Process a Paystack refund.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Refund Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      refundAmount
                    }
                    onChange={(event) =>
                      setRefundAmount(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Leave empty for full refund"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Reason
                  </label>

                  <textarea
                    value={
                      refundReason
                    }
                    onChange={(event) =>
                      setRefundReason(
                        event.target
                          .value,
                      )
                    }
                    rows={3}
                    placeholder="Reason for refund..."
                    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    handleRefund
                  }
                  disabled={
                    refundOrderMutation.isPending
                  }
                  className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {refundOrderMutation.isPending
                    ? "Processing Refund..."
                    : "Process Refund"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// ADDRESS CARD
// ============================================================

function AddressCard({
  title,
  address,
  snapshot,
}: AddressCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <MapPin className="h-5 w-5" />
        </div>

        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>
      </div>

      {snapshot ? (
        <div className="mt-4 space-y-1 text-sm text-slate-600">
          <p className="font-medium text-slate-800">
            {snapshot.fullName}
          </p>

          <p>{snapshot.phone}</p>

          <p>{snapshot.addressLine1}</p>

          {snapshot.addressLine2 && (
            <p>
              {snapshot.addressLine2}
            </p>
          )}

          <p>
            {snapshot.city},{" "}
            {snapshot.state}
          </p>

          <p>{snapshot.postalCode}</p>

          <p>{snapshot.country}</p>
        </div>
      ) : address ? (
        <div className="mt-4 space-y-1 text-sm text-slate-600">
          <p>{address.addressLine1}</p>

          {address.addressLine2 && (
            <p>
              {address.addressLine2}
            </p>
          )}

          <p>
            {address.city},{" "}
            {address.state}
          </p>

          <p>{address.postalCode}</p>

          <p>{address.country}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          No address available.
        </p>
      )}
    </div>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;

  value: string;

  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={
          strong
            ? "text-right text-sm font-bold text-slate-900"
            : "text-right text-sm font-medium capitalize text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
}