import Link from "next/link";

import type {
  AdminInventoryProduct,
} from "@/lib/query/inventories/admin-inventory-types";

type InventoryProductHeaderProps = {
  product: AdminInventoryProduct;
};

export function InventoryProductHeader({
  product,
}: InventoryProductHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href="/admin/inventory"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Inventory
        </Link>

        <h1 className="mt-2 text-2xl font-semibold text-[#0B1F3B]">
          {product.name}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage inventory and stock levels for this product.
        </p>
      </div>
    </div>
  );
}