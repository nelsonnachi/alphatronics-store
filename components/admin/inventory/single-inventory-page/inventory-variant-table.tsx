"use client";

import { useState } from "react";


import type {
  AdminInventoryVariant,
} from "@/lib/query/inventories/admin-inventory-types";
import { InventoryStatusBadge } from "../inventory-status-badge";
import { InventoryStockForm } from "../inventory-stock-form";

type InventoryVariantTableProps = {
  productId: string;
  variants: AdminInventoryVariant[];
};

export function InventoryVariantTable({
  productId,
  variants,
}: InventoryVariantTableProps) {
  const [editingVariantId, setEditingVariantId] =
    useState<string | null>(null);

  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h3 className="font-semibold text-[#0B1F3B]">
          No variants found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          This product does not have any variants.
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* HEADER */}

      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-[#0B1F3B]">
          Variants
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage stock levels for each product variant.
        </p>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Variant
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                SKU
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stock
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reserved
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Available
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {variants.map((variant) => {
              const isEditing =
                editingVariantId === variant.id;

              return (
                <tr
                  key={variant.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  {/* VARIANT */}

                  <td className="px-5 py-4">
                    <p className="font-medium text-[#0B1F3B]">
                      {variant.name}
                    </p>
                  </td>

                  {/* SKU */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {variant.sku}
                  </td>

                  {/* STOCK */}

                  <td className="px-5 py-4 text-right text-sm font-medium text-[#0B1F3B]">
                    {variant.stock.toLocaleString()}
                  </td>

                  {/* RESERVED */}

                  <td className="px-5 py-4 text-right text-sm text-slate-600">
                    {variant.reservedStock.toLocaleString()}
                  </td>

                  {/* AVAILABLE */}

                  <td className="px-5 py-4 text-right text-sm font-semibold text-[#0B1F3B]">
                    {variant.availableStock.toLocaleString()}
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <InventoryStatusBadge
                      status={variant.stockStatus}
                    />
                  </td>

                  {/* ACTION */}

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingVariantId(
                          isEditing
                            ? null
                            : variant.id,
                        )
                      }
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {isEditing
                        ? "Cancel"
                        : "Edit Stock"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          EDIT PANEL
          ======================================================== */}

      {editingVariantId && (
        <div className="border-t border-slate-200 bg-slate-50 p-5">
          {variants.map((variant) => {
            if (variant.id !== editingVariantId) {
              return null;
            }

            return (
              <div
                key={variant.id}
                className="max-w-xl"
              >
                <div className="mb-5">
                  <h3 className="font-semibold text-[#0B1F3B]">
                    Edit {variant.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    SKU: {variant.sku}
                  </p>
                </div>

                <InventoryStockForm
                  type="variant"
                  productId={productId}
                  variant={variant}
                  onSuccess={() =>
                    setEditingVariantId(null)
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}