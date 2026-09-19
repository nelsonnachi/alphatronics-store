import type {
  AdminProductInventorySummary,
} from "@/lib/query/inventories/admin-inventory-types";

type InventoryProductSummaryProps = {
  inventory: AdminProductInventorySummary;
};

export function InventoryProductSummary({
  inventory,
}: InventoryProductSummaryProps) {
  const cards = [
    {
      label: "Physical Stock",
      value: inventory.physicalStock,
    },
    {
      label: "Reserved Stock",
      value: inventory.reservedStock,
    },
    {
      label: "Available Stock",
      value: inventory.availableStock,
    },
    {
      label: "Total Variants",
      value: inventory.totalVariants,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <p className="text-sm text-slate-500">
            {card.label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0B1F3B]">
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </section>
  );
}