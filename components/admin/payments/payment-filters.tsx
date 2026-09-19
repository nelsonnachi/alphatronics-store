import { AdminPaymentStatus } from "@/lib/query/payments/admin-payments-types";


type PaymentFiltersProps = {
  search: string;

  status:
    | AdminPaymentStatus
    | undefined;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value:
      | AdminPaymentStatus
      | undefined,
  ) => void;
};

export function PaymentFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: PaymentFiltersProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
        {/* ===================================================
            SEARCH
        =================================================== */}

        <div>
          <label
            htmlFor="payment-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search payments
          </label>

          <input
            id="payment-search"
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search order number, email or reference..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
          />
        </div>

        {/* ===================================================
            STATUS
        =================================================== */}

        <div>
          <label
            htmlFor="payment-status"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Status
          </label>

          <select
            id="payment-status"
            value={status ?? ""}
            onChange={(event) => {
              const value =
                event.target.value;

              onStatusChange(
                value
                  ? (value as AdminPaymentStatus)
                  : undefined,
              );
            }}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
          >
            <option value="">
              All payments
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="partially_refunded">
              Partially refunded
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}