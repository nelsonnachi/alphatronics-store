"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type ShopPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function ShopPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ShopPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // ==========================================================
  // CREATE A SMALL SET OF PAGE NUMBERS
  // ==========================================================

  const pages: (number | "...")[] = [];

  if (totalPages <= 5) {
    for (let page = 1; page <= totalPages; page++) {
      pages.push(page);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(
      2,
      currentPage - 1,
    );

    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1,
    );

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Product pagination"
      className="flex flex-wrap items-center justify-center gap-1 pt-6"
    >
      {/* =====================================================
          PREVIOUS
      ===================================================== */}

      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(currentPage - 1)
        }
        className="flex h-8 items-center gap-1 rounded-md border border-[#E2E8F0] px-2.5 text-[10px] font-medium text-[#64748B] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
      >
        <ChevronLeft className="size-3.5" />

        <span className="hidden sm:inline">
          Prev
        </span>
      </button>

      {/* =====================================================
          PAGE NUMBERS
      ===================================================== */}

      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex size-8 items-center justify-center text-[10px] text-[#94A3B8]"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={
              currentPage === page
                ? "page"
                : undefined
            }
            className={`flex size-8 items-center justify-center rounded-md text-[10px] font-semibold ${
              currentPage === page
                ? "bg-[#2563EB] text-white"
                : "border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* =====================================================
          NEXT
      ===================================================== */}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() =>
          onPageChange(currentPage + 1)
        }
        className="flex h-8 items-center gap-1 rounded-md border border-[#E2E8F0] px-2.5 text-[10px] font-medium text-[#64748B] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
      >
        <span className="hidden sm:inline">
          Next
        </span>

        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}