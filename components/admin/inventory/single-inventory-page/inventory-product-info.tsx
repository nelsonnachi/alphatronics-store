import type {
  AdminInventoryProduct,
} from "@/lib/query/inventories/admin-inventory-types";

type InventoryProductInfoProps = {
  product: AdminInventoryProduct;
};

export function InventoryProductInfo({
  product,
}: InventoryProductInfoProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* PRODUCT NAME */}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Product
          </p>

          <p className="mt-1 font-medium text-[#0B1F3B]">
            {product.name}
          </p>
        </div>

        {/* SKU */}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            SKU
          </p>

          <p className="mt-1 font-medium text-[#0B1F3B]">
            {product.sku}
          </p>
        </div>

        {/* INVENTORY TYPE */}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Inventory Type
          </p>

          <p className="mt-1 font-medium capitalize text-[#0B1F3B]">
            {product.inventoryType}
          </p>
        </div>
      </div>
    </section>
  );
}