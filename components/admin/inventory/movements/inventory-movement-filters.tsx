"use client";

type InventoryMovementFiltersProps = {
  search: string;
  type: string;
  direction: string;
  from: string;
  to: string;
  sort: string;

  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onDirectionChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export function InventoryMovementFilters({
  search,
  type,
  direction,
  from,
  to,
  sort,
  onSearchChange,
  onTypeChange,
  onDirectionChange,
  onFromChange,
  onToChange,
  onSortChange,
}: InventoryMovementFiltersProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* SEARCH */}

        <div className="xl:col-span-2">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search product, SKU, order..."
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500"
          />
        </div>

        {/* MOVEMENT TYPE */}

        <select
          value={type}
          onChange={(event) =>
            onTypeChange(event.target.value)
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="adjustment">Adjustment</option>
          <option value="sale">Sale</option>
          <option value="return">Return</option>
          <option value="release">Release</option>
          <option value="damage">Damage</option>
          <option value="restock">Restock</option>
        </select>

        {/* DIRECTION */}

        <select
          value={direction}
          onChange={(event) =>
            onDirectionChange(event.target.value)
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Directions</option>
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>

        {/* FROM */}

        <input
          type="date"
          value={from}
          onChange={(event) =>
            onFromChange(event.target.value)
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
        />

        {/* TO */}

        <input
          type="date"
          value={to}
          onChange={(event) =>
            onToChange(event.target.value)
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
        />

        {/* SORT */}

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value)
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>
        </select>
      </div>
    </div>
  );
}