import { StockStatus } from "@/lib/query/inventories/admin-inventory-types";


type InventoryStatusBadgeProps = {
  status: StockStatus;
};

export function InventoryStatusBadge({
  status,
}: InventoryStatusBadgeProps) {
  if (status === "in_stock") {
    return (
      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        In Stock
      </span>
    );
  }

  if (status === "low_stock") {
    return (
      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      Out of Stock
    </span>
  );
}