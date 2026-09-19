"use client";

import { X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CartItem } from "./cart-item";
import { useCart, useClearCart } from "@/lib/query/cart/use-cart-hooks";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function CartDrawer({
  open,
  onClose,
}: CartDrawerProps) {
  const { data, isLoading, isError } = useCart();

  const clearCart = useClearCart();

  const cart = data?.data;

  return (
    <>
      {/* ================================================== */}
      {/* BACKDROP */}
      {/* ================================================== */}

      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* ================================================== */}
      {/* DRAWER */}
      {/* ================================================== */}

      <aside
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] px-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#2563EB]" />

            <div>
              <h2 className="text-base font-semibold text-[#0F172A]">
                Shopping Cart
              </h2>

              {cart && cart.itemCount > 0 && (
                <p className="text-xs text-[#64748B]">
                  {cart.itemCount}{" "}
                  {cart.itemCount === 1
                    ? "item"
                    : "items"}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================== */}
        {/* CART CONTENT */}
        {/* ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {/* Loading */}
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2563EB]" />

                <p className="mt-3 text-sm text-[#64748B]">
                  Loading your cart...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {!isLoading && isError && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-xs text-center">
                <p className="text-sm font-medium text-[#0F172A]">
                  We could not load your cart.
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Please close the cart and try again.
                </p>
              </div>
            </div>
          )}

          {/* Empty Cart */}
          {!isLoading &&
            !isError &&
            (!cart || cart.items.length === 0) && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <ShoppingBag className="h-7 w-7 text-[#2563EB]" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#0F172A]">
                  Your cart is empty
                </h3>

                <p className="mt-1 max-w-xs text-sm text-[#64748B]">
                  Looks like you haven't added
                  anything to your cart yet.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  Continue Shopping
                </button>
              </div>
            )}

          {/* Cart Items */}
          {!isLoading &&
            !isError &&
            cart &&
            cart.items.length > 0 && (
              <div>
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
        </div>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        {!isLoading &&
          !isError &&
          cart &&
          cart.items.length > 0 && (
            <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-5 py-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">
                  Subtotal
                </span>

                <span className="text-lg font-bold text-[#0F172A]">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#94A3B8]">
                Shipping and taxes are calculated at
                checkout.
              </p>

              {/* Checkout */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                Proceed to Checkout

                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Clear Cart */}
              <button
                type="button"
                onClick={() =>
                  clearCart.mutate()
                }
                disabled={clearCart.isPending}
                className="mt-3 w-full text-center text-xs font-medium text-[#64748B] hover:text-red-500 disabled:opacity-50"
              >
                {clearCart.isPending
                  ? "Clearing cart..."
                  : "Clear cart"}
              </button>
            </div>
          )}
      </aside>
    </>
  );
}