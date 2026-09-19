"use client";

type InventoryFiltersProps = {
  search: string;
  status: string;
  type: string;
  sort: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export function InventoryFilters({
  search,
  status,
  type,
  sort,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:flex-row">
      {/* SEARCH */}

      <div className="flex-1">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search product or SKU..."
          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500"
        />
      </div>

      {/* STATUS */}

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value)
        }
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
      >
        <option value="">All Status</option>
        <option value="in_stock">In Stock</option>
        <option value="low_stock">Low Stock</option>
        <option value="out_of_stock">
          Out of Stock
        </option>
      </select>

      {/* TYPE */}

      <select
        value={type}
        onChange={(event) =>
          onTypeChange(event.target.value)
        }
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
      >
        <option value="">All Types</option>
        <option value="product">Product</option>
        <option value="variant">Variant</option>
      </select>

      {/* SORT */}

      <select
        value={sort}
        onChange={(event) =>
          onSortChange(event.target.value)
        }
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
      >
        <option value="stock_asc">
          Stock: Low to High
        </option>

        <option value="stock_desc">
          Stock: High to Low
        </option>

        <option value="name_asc">
          Name: A-Z
        </option>

        <option value="name_desc">
          Name: Z-A
        </option>

        <option value="newest">
          Newest
        </option>

        <option value="oldest">
          Oldest
        </option>
      </select>
    </div>
  );
}