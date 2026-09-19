import Link from "next/link";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { AdminInventoryItem } from "@/lib/query/inventories/admin-inventory-types";

type InventoryTableProps = {
  inventory: AdminInventoryItem[];
};

export function InventoryTable({
  inventory,
}: InventoryTableProps) {
  if (inventory.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-[#0B1F3B]">
          No inventory found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Product
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                SKU
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
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

              <th className="px-5 py-4" />
            </tr>
          </thead>

          <tbody>
            {inventory.map((item) => (
              <tr
                key={
                  item.type === "variant"
                    ? item.variantId
                    : item.productId
                }
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                {/* PRODUCT */}

                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-[#0B1F3B]">
                      {item.productName}
                    </p>

                    {item.type === "variant" &&
                      item.variantName && (
                        <p className="mt-1 text-xs text-slate-500">
                          {item.variantName}
                        </p>
                      )}
                  </div>
                </td>

                {/* SKU */}

                <td className="px-5 py-4 text-sm text-slate-600">
                  {item.type === "variant"
                    ? item.variantSku
                    : item.productSku}
                </td>

                {/* TYPE */}

                <td className="px-5 py-4">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {item.type === "variant"
                      ? "Variant"
                      : "Product"}
                  </span>
                </td>

                {/* STOCK */}

                <td className="px-5 py-4 text-right text-sm font-medium text-[#0B1F3B]">
                  {item.stock.toLocaleString()}
                </td>

                {/* RESERVED */}

                <td className="px-5 py-4 text-right text-sm text-slate-600">
                  {item.reservedStock.toLocaleString()}
                </td>

                {/* AVAILABLE */}

                <td className="px-5 py-4 text-right text-sm font-semibold text-[#0B1F3B]">
                  {item.availableStock.toLocaleString()}
                </td>

                {/* STATUS */}

                <td className="px-5 py-4">
                  <InventoryStatusBadge
                    status={item.stockStatus}
                  />
                </td>

                {/* ACTION */}

                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/inventory/${item.productId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}