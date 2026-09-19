"use client";

import Link from "next/link";
import {
  Bell,
  Menu,
  Plus,
  Search,
} from "lucide-react";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

export function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#e7eaf1] bg-white">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-5 lg:px-7">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e7eaf1] text-[#5b6472] hover:bg-[#f4f6fb] lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-bold text-[#0f172a] sm:text-[19px]">
              Dashboard
            </h1>

            <p className="hidden truncate text-[12.5px] text-[#5b6472] sm:block">
              Welcome back — here&apos;s what&apos;s happening
              at Alphatronics today.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="hidden h-[38px] w-[220px] items-center gap-2 rounded-[10px] border border-[#e7eaf1] bg-[#f4f6fb] px-3.5 text-[13px] text-[#8993a4] md:flex lg:w-[280px]">
            <Search className="h-[15px] w-[15px] shrink-0" />

            <span className="truncate">
              Search orders, products, customers...
            </span>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#e7eaf1] bg-white text-[#5b6472] hover:bg-[#f4f6fb]"
            aria-label="Notifications"
          >
            <Bell className="h-[17px] w-[17px]" />

            <span className="absolute right-[7px] top-[7px] h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[#e0533f]" />
          </button>

          {/* Add Product */}
          <Link
            href="/admin/products/new"
            className="flex h-[38px] items-center gap-1.5 rounded-[10px] bg-[#2f5fe0] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2452cf]"
          >
            <Plus className="h-[14px] w-[14px]" />

            <span className="hidden sm:inline">
              Add Product
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}