import { AdminInventorySummary } from "@/lib/query/inventories/admin-inventory-types";


type InventorySummaryProps = {
  summary: AdminInventorySummary;
};

export function InventorySummary({
  summary,
}: InventorySummaryProps) {
  const cards = [
    {
      label: "Products",
      value: summary.totalProducts,
    },
    {
      label: "Physical Stock",
      value: summary.physicalStock,
    },
    {
      label: "Available Stock",
      value: summary.availableStock,
    },
    {
      label: "Reserved Stock",
      value: summary.reservedStock,
    },
    {
      label: "Low Stock",
      value: summary.lowStockItems,
    },
    {
      label: "Out of Stock",
      value: summary.outOfStockItems,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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