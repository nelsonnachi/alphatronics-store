"use client";

import { Plus, Trash2, Layers3, ImagePlus } from "lucide-react";
import { useRef } from "react";

import type { ProductVariantForm } from "./add-product-form";

type ProductVariantsProps = {
  variants: ProductVariantForm[];
  onVariantsChange: (
    variants: ProductVariantForm[],
  ) => void;
};

export function ProductVariants({
  variants,
  onVariantsChange,
}: ProductVariantsProps) {
  function addVariant() {
    onVariantsChange([
      ...variants,
      {
        id: crypto.randomUUID(),
        name: "",
        sku: "",
        price: "",
        compareAtPrice: "",
        stock: "0",
        imageFile: null,
        imagePreview: "",
        attributes: [],
      },
    ]);
  }

  function removeVariant(id: string) {
    onVariantsChange(
      variants.filter((variant) => variant.id !== id),
    );
  }

  function updateVariant(
    id: string,
    field:
      | "name"
      | "sku"
      | "price"
      | "compareAtPrice"
      | "stock",
    value: string,
  ) {
    onVariantsChange(
      variants.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  }

  function addAttribute(variantId: string) {
    onVariantsChange(
      variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              attributes: [
                ...variant.attributes,
                {
                  key: "",
                  value: "",
                },
              ],
            }
          : variant,
      ),
    );
  }

  function removeAttribute(
    variantId: string,
    attributeIndex: number,
  ) {
    onVariantsChange(
      variants.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }

        return {
          ...variant,
          attributes: variant.attributes.filter(
            (_, index) => index !== attributeIndex,
          ),
        };
      }),
    );
  }

  function updateAttribute(
    variantId: string,
    attributeIndex: number,
    field: "key" | "value",
    value: string,
  ) {
    onVariantsChange(
      variants.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }

        return {
          ...variant,
          attributes: variant.attributes.map(
            (attribute, index) =>
              index === attributeIndex
                ? {
                    ...attribute,
                    [field]: value,
                  }
                : attribute,
          ),
        };
      }),
    );
  }

  function handleVariantImage(
    variantId: string,
    file: File | undefined,
  ) {
    if (!file) return;

    const preview = URL.createObjectURL(file);

    onVariantsChange(
      variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              imageFile: file,
              imagePreview: preview,
            }
          : variant,
      ),
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Layers3 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Product Variants
            </h2>

            <p className="text-xs text-slate-500">
              Add different versions of this product.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add Variant
        </button>
      </div>

      <div className="p-5">
        {variants.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm text-slate-500">
              This product has no variants.
            </p>

            <button
              type="button"
              onClick={addVariant}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Add a variant
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {variants.map((variant, index) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                index={index}
                onRemove={() => removeVariant(variant.id)}
                onUpdate={(field, value) =>
                  updateVariant(
                    variant.id,
                    field,
                    value,
                  )
                }
                onAddAttribute={() =>
                  addAttribute(variant.id)
                }
                onRemoveAttribute={(attributeIndex) =>
                  removeAttribute(
                    variant.id,
                    attributeIndex,
                  )
                }
                onUpdateAttribute={(
                  attributeIndex,
                  field,
                  value,
                ) =>
                  updateAttribute(
                    variant.id,
                    attributeIndex,
                    field,
                    value,
                  )
                }
                onImageChange={(file) =>
                  handleVariantImage(
                    variant.id,
                    file,
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type VariantCardProps = {
  variant: ProductVariantForm;
  index: number;
  onRemove: () => void;
  onUpdate: (
    field:
      | "name"
      | "sku"
      | "price"
      | "compareAtPrice"
      | "stock",
    value: string,
  ) => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (index: number) => void;
  onUpdateAttribute: (
    index: number,
    field: "key" | "value",
    value: string,
  ) => void;
  onImageChange: (file: File | undefined) => void;
};

function VariantCard({
  variant,
  index,
  onRemove,
  onUpdate,
  onAddAttribute,
  onRemoveAttribute,
  onUpdateAttribute,
  onImageChange,
}: VariantCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-xl border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Variant {index + 1}
          </p>

          {variant.name && (
            <p className="text-xs text-slate-400">
              {variant.name}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          title="Remove variant"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5 p-4">
        {/* NAME / SKU */}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Variant Name
            </label>

            <input
              value={variant.name}
              onChange={(event) =>
                onUpdate(
                  "name",
                  event.target.value,
                )
              }
              placeholder="256GB / Natural Titanium"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              SKU
            </label>

            <input
              value={variant.sku}
              onChange={(event) =>
                onUpdate(
                  "sku",
                  event.target.value,
                )
              }
              placeholder="APL-IP15PM-256-NAT"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* PRICE / STOCK */}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={variant.price}
              onChange={(event) =>
                onUpdate(
                  "price",
                  event.target.value,
                )
              }
              placeholder="Optional"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Compare-at Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={variant.compareAtPrice}
              onChange={(event) =>
                onUpdate(
                  "compareAtPrice",
                  event.target.value,
                )
              }
              placeholder="Optional"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Stock
            </label>

            <input
              type="number"
              min="0"
              value={variant.stock}
              onChange={(event) =>
                onUpdate(
                  "stock",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* VARIANT IMAGE */}

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-600">
            Variant Image
          </label>

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs font-medium text-slate-600 hover:border-blue-400 hover:bg-blue-50/30"
          >
            <ImagePlus className="h-4 w-4" />
            Choose image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) =>
              onImageChange(
                event.target.files?.[0],
              )
            }
          />

          {variant.imagePreview && (
            <div className="mt-3 h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={variant.imagePreview}
                alt="Variant preview"
                className="h-full w-full object-contain p-2"
              />
            </div>
          )}
        </div>

        {/* ATTRIBUTES */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Attributes
              </p>

              <p className="text-[11px] text-slate-400">
                Example: storage = 256GB, color = Natural Titanium
              </p>
            </div>

            <button
              type="button"
              onClick={onAddAttribute}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              + Add attribute
            </button>
          </div>

          {variant.attributes.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-400">
              No attributes added.
            </p>
          ) : (
            <div className="space-y-2">
              {variant.attributes.map(
                (attribute, attributeIndex) => (
                  <div
                    key={`${variant.id}-${attributeIndex}`}
                    className="flex gap-2"
                  >
                    <input
                      value={attribute.key}
                      onChange={(event) =>
                        onUpdateAttribute(
                          attributeIndex,
                          "key",
                          event.target.value,
                        )
                      }
                      placeholder="Attribute"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <input
                      value={attribute.value}
                      onChange={(event) =>
                        onUpdateAttribute(
                          attributeIndex,
                          "value",
                          event.target.value,
                        )
                      }
                      placeholder="Value"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onRemoveAttribute(
                          attributeIndex,
                        )
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}