"use client";

import { Plus, Trash2, List } from "lucide-react";

import type { ProductSpecificationForm } from "./add-product-form";

type ProductSpecificationsProps = {
  specifications: ProductSpecificationForm[];
  onSpecificationsChange: (
    specifications: ProductSpecificationForm[],
  ) => void;
};

export function ProductSpecifications({
  specifications,
  onSpecificationsChange,
}: ProductSpecificationsProps) {
  function addSpecification() {
    onSpecificationsChange([
      ...specifications,
      {
        id: crypto.randomUUID(),
        group: "General",
        key: "",
        value: "",
      },
    ]);
  }

  function removeSpecification(id: string) {
    onSpecificationsChange(
      specifications.filter((spec) => spec.id !== id),
    );
  }

  function updateSpecification(
    id: string,
    field: "group" | "key" | "value",
    value: string,
  ) {
    onSpecificationsChange(
      specifications.map((spec) =>
        spec.id === id
          ? {
              ...spec,
              [field]: value,
            }
          : spec,
      ),
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <List className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Specifications
            </h2>

            <p className="text-xs text-slate-500">
              Add technical specifications for the product.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addSpecification}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="p-5">
        {specifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm text-slate-500">
              No specifications added yet.
            </p>

            <button
              type="button"
              onClick={addSpecification}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Add your first specification
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {specifications.map((specification, index) => (
              <div
                key={specification.id}
                className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-[1fr_1fr_1.5fr_auto]"
              >
                <input
                  value={specification.group}
                  onChange={(event) =>
                    updateSpecification(
                      specification.id,
                      "group",
                      event.target.value,
                    )
                  }
                  placeholder="Group"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  value={specification.key}
                  onChange={(event) =>
                    updateSpecification(
                      specification.id,
                      "key",
                      event.target.value,
                    )
                  }
                  placeholder="Specification name"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  value={specification.value}
                  onChange={(event) =>
                    updateSpecification(
                      specification.id,
                      "value",
                      event.target.value,
                    )
                  }
                  placeholder="Value"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeSpecification(specification.id)
                  }
                  className="flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title={`Remove specification ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}