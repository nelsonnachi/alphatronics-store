"use client";

import Link from "next/link";

import { useAdminProductInventory } from "@/lib/query/inventories/admin-inventory-hooks";

import { InventoryProductHeader } from "./inventory-product-header";
import { InventoryProductSummary } from "./inventory-product-summary";
import { InventoryProductInfo } from "./inventory-product-info";
import { InventoryVariantTable } from "./inventory-variant-table";
import { InventoryStockForm } from "../inventory-stock-form";

type InventoryProductPageProps = {
  productId: string;
};

export function InventoryProductPage({ productId }: InventoryProductPageProps) {
  const { data, isLoading, isError, error } =
    useAdminProductInventory(productId);

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="h-32 animate-pulse rounded-lg bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg bg-slate-200"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">Failed to load inventory</h2>

        <p className="mt-1 text-sm text-red-600">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>

        <Link
          href="/admin/inventory"
          className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Back to Inventory
        </Link>
      </div>
    );
  }

  // ============================================================
  // NO DATA
  // ============================================================

  if (!data) {
    return null;
  }

  const isProductInventory = data.product.inventoryType === "product";

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <InventoryProductHeader product={data.product} />

      {/* PRODUCT INFORMATION */}

      <InventoryProductInfo product={data.product} />

      {/* SUMMARY */}

      <InventoryProductSummary inventory={data.inventory} />

      {/* ========================================================
          PRODUCT INVENTORY
          ======================================================== */}

      {isProductInventory && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-[#0B1F3B]">Update Inventory</h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the stock levels for this product.
            </p>
          </div>

          <div className="max-w-xl">
            <InventoryStockForm
              type="product"
              productId={data.product.id}
              stock={data.inventory.physicalStock}
              reservedStock={data.inventory.reservedStock}
              lowStockThreshold={data.inventory.lowStockThreshold ?? 5}
            />
          </div>
        </section>
      )}

      {/* ========================================================
          VARIANT INVENTORY
          ======================================================== */}

      {!isProductInventory && (
        <InventoryVariantTable
          productId={data.product.id}
          variants={data.variants}
        />
      )}
    </div>
  );
}
