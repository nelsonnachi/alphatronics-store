"use client";

import { useEffect, useState } from "react";

import {
  useUpdateProductInventory,
  useUpdateVariantInventory,
} from "@/lib/query/inventories/admin-inventory-hooks";

import type {
  AdminInventoryVariant,
} from "@/lib/query/inventories/admin-inventory-types";

type InventoryStockFormProps =
  | {
      type: "product";
      productId: string;
      stock: number;
      reservedStock: number;
      lowStockThreshold: number;
      onSuccess?: () => void;
    }
  | {
      type: "variant";
      productId: string;
      variant: AdminInventoryVariant;
      onSuccess?: () => void;
    };

export function InventoryStockForm(
  props: InventoryStockFormProps,
) {
  const updateProductInventory =
    useUpdateProductInventory();

  const updateVariantInventory =
    useUpdateVariantInventory();

  // ============================================================
  // INITIAL VALUES
  // ============================================================

  const initialStock =
    props.type === "product"
      ? props.stock
      : props.variant.stock;

  const initialReservedStock =
    props.type === "product"
      ? props.reservedStock
      : props.variant.reservedStock;

  const initialLowStockThreshold =
    props.type === "product"
      ? props.lowStockThreshold
      : props.variant.lowStockThreshold;

  // ============================================================
  // FORM STATE
  // ============================================================

  const [stock, setStock] =
    useState(initialStock);

  const [reservedStock, setReservedStock] =
    useState(initialReservedStock);

  const [lowStockThreshold, setLowStockThreshold] =
    useState(initialLowStockThreshold);

  // ============================================================
  // KEEP FORM IN SYNC WITH API DATA
  // ============================================================

  useEffect(() => {
    setStock(initialStock);
    setReservedStock(initialReservedStock);
    setLowStockThreshold(initialLowStockThreshold);
  }, [
    initialStock,
    initialReservedStock,
    initialLowStockThreshold,
  ]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  const isUpdating =
    updateProductInventory.isPending ||
    updateVariantInventory.isPending;

  // ============================================================
  // SUBMIT
  // ============================================================

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (stock < 0) {
      return;
    }

    if (reservedStock < 0) {
      return;
    }

    if (lowStockThreshold < 0) {
      return;
    }

    if (reservedStock > stock) {
      return;
    }

    // ========================================================
    // PRODUCT INVENTORY
    // ========================================================

    if (props.type === "product") {
      updateProductInventory.mutate(
        {
          productId: props.productId,

          data: {
            stock,
            reservedStock,
            lowStockThreshold,
          },
        },
        {
          onSuccess: () => {
            props.onSuccess?.();
          },
        },
      );

      return;
    }

    // ========================================================
    // VARIANT INVENTORY
    // ========================================================

    updateVariantInventory.mutate(
      {
        productId: props.productId,
        variantId: props.variant.id,

        data: {
          stock,
          reservedStock,
          lowStockThreshold,
        },
      },
      {
        onSuccess: () => {
          props.onSuccess?.();
        },
      },
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  const mutationError =
    updateProductInventory.error ||
    updateVariantInventory.error;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* ======================================================
          STOCK
      ====================================================== */}

      <div>
        <label
          htmlFor="stock"
          className="block text-sm font-medium text-slate-700"
        >
          Physical Stock
        </label>

        <input
          id="stock"
          type="number"
          min="0"
          value={stock}
          onChange={(event) =>
            setStock(Number(event.target.value))
          }
          disabled={isUpdating}
          className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
        />

        <p className="mt-1 text-xs text-slate-500">
          Total physical units currently in your inventory.
        </p>
      </div>

      {/* ======================================================
          RESERVED STOCK
      ====================================================== */}

      <div>
        <label
          htmlFor="reservedStock"
          className="block text-sm font-medium text-slate-700"
        >
          Reserved Stock
        </label>

        <input
          id="reservedStock"
          type="number"
          min="0"
          value={reservedStock}
          onChange={(event) =>
            setReservedStock(
              Number(event.target.value),
            )
          }
          disabled={isUpdating}
          className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
        />

        <p className="mt-1 text-xs text-slate-500">
          Units currently reserved for pending orders.
        </p>
      </div>

      {/* ======================================================
          LOW STOCK THRESHOLD
      ====================================================== */}

      <div>
        <label
          htmlFor="lowStockThreshold"
          className="block text-sm font-medium text-slate-700"
        >
          Low Stock Threshold
        </label>

        <input
          id="lowStockThreshold"
          type="number"
          min="0"
          value={lowStockThreshold}
          onChange={(event) =>
            setLowStockThreshold(
              Number(event.target.value),
            )
          }
          disabled={isUpdating}
          className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
        />

        <p className="mt-1 text-xs text-slate-500">
          Inventory is considered low when available stock
          reaches this number.
        </p>
      </div>

      {/* ======================================================
          AVAILABLE STOCK PREVIEW
      ====================================================== */}

      <div className="rounded-md bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          Available Stock
        </p>

        <p className="mt-1 text-xl font-semibold text-[#0B1F3B]">
          {Math.max(stock - reservedStock, 0).toLocaleString()}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Physical stock minus reserved stock.
        </p>
      </div>

      {/* ======================================================
          VALIDATION MESSAGE
      ====================================================== */}

      {reservedStock > stock && (
        <p className="text-sm text-red-600">
          Reserved stock cannot be greater than physical
          stock.
        </p>
      )}

      {/* ======================================================
          API ERROR
      ====================================================== */}

      {mutationError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">
            {mutationError instanceof Error
              ? mutationError.message
              : "Failed to update inventory."}
          </p>
        </div>
      )}

      {/* ======================================================
          SUBMIT
      ====================================================== */}

      <button
        type="submit"
        disabled={
          isUpdating ||
          reservedStock > stock
        }
        className="inline-flex h-10 items-center justify-center rounded-md bg-[#2563EB] px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUpdating
          ? "Saving..."
          : "Save Inventory"}
      </button>
    </form>
  );
}