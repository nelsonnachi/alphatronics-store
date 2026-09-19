"use client";

type InventoryMovementPaginationProps = {
  page: number;
  totalPages: number;
  total: number;

  onPrevious: () => void;
  onNext: () => void;
};

export function InventoryMovementPagination({
  page,
  totalPages,
  total,
  onPrevious,
  onNext,
}: InventoryMovementPaginationProps) {
  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4">
      {/* LEFT */}

      <p className="text-sm text-slate-500">
        Page{" "}
        <span className="font-medium text-slate-700">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-700">
          {totalPages}
        </span>
      </p>

      {/* RIGHT */}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={page === 1}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}