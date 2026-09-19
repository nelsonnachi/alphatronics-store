"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useRemoveCartItem, useUpdateCartItem } from "@/lib/query/cart/use-cart-hooks";
import type { CartItem } from "@/lib/query/cart/use-cart-types";

type CartItemProps = {
  item: CartItem;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function CartItem({ item }: CartItemProps) {
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const product = item.product;
  const variant = item.variant;

  const image =
    product.images.find((image) => image.isPrimary) ??
    product.images[0];

  const unitPrice = variant?.price
    ? Number(variant.price)
    : Number(product.price);

  const itemTotal = unitPrice * item.quantity;

  const decreaseQuantity = () => {
    if (item.quantity === 1) {
      removeCartItem.mutate(item.id);
      return;
    }

    updateCartItem.mutate({
      itemId: item.id,
      quantity: item.quantity - 1,
    });
  };

  const increaseQuantity = () => {
    updateCartItem.mutate({
      itemId: item.id,
      quantity: item.quantity + 1,
    });
  };

  const isUpdating =
    updateCartItem.isPending ||
    removeCartItem.isPending;

  return (
    <div className="border-b border-[#E2E8F0] py-4">
      <div className="flex gap-3">
        {/* Product Image */}
        <Link
          href={`/products/${product.slug}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[#E2E8F0] bg-white"
        >
          <Image
            src={
              image?.url ??
              "/images/products/product-placeholder.jpg"
            }
            alt={product.name}
            fill
            sizes="80px"
            className="object-contain p-2"
          />
        </Link>

        {/* Product Information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-2 text-sm font-medium text-[#0F172A] hover:text-[#2563EB]"
              >
                {product.name}
              </Link>

              {/* Variant */}
              {variant && (
                <div className="mt-1">
                  {variant.name && (
                    <p className="text-xs text-[#64748B]">
                      {variant.name}
                    </p>
                  )}

                  {Object.entries(variant.attributes).map(
                    ([key, value]) => (
                      <p
                        key={key}
                        className="text-[11px] text-[#94A3B8]"
                      >
                        {key}: {value}
                      </p>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() =>
                removeCartItem.mutate(item.id)
              }
              disabled={isUpdating}
              aria-label={`Remove ${product.name}`}
              className="shrink-0 text-[#94A3B8] transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Price */}
          <p className="mt-2 text-sm font-semibold text-[#0F172A]">
            {formatPrice(unitPrice)}
          </p>

          {/* Quantity + Item Total */}
          <div className="mt-3 flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex h-8 items-center rounded-md border border-[#E2E8F0]">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={isUpdating}
                aria-label="Decrease quantity"
                className="flex h-full w-8 items-center justify-center text-[#64748B] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="flex h-full min-w-8 items-center justify-center border-x border-[#E2E8F0] px-2 text-xs font-medium text-[#0F172A]">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  isUpdating ||
                  item.quantity >= 50
                }
                aria-label="Increase quantity"
                className="flex h-full w-8 items-center justify-center text-[#64748B] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Item Total */}
            <p className="text-sm font-bold text-[#0F172A]">
              {formatPrice(itemTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}