"use client";

import { useCart } from "@/lib/query/cart/use-cart-hooks";
import { ShoppingCart } from "lucide-react";



type CartButtonProps = {
  onClick: () => void;
};

export function CartButton({
  onClick,
}: CartButtonProps) {
  const { data } = useCart();

  const itemCount =
    data?.data?.itemCount ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open shopping cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
    >
      <ShoppingCart className="h-5 w-5" />

      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2563EB] px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}