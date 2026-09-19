"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type {
  Category,
  CreateCategoryInput,
} from "@/lib/query/categories/category-types";

type CategoryFormProps = {
  category: Category | null;
  categories: Category[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => void;
};

export function CategoryForm({
  category,
  categories,
  isSubmitting,
  onClose,
  onSubmit,
}: CategoryFormProps) {
  const isEditing = Boolean(category);

  // ============================================================
  // FORM STATE
  // ============================================================

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [description, setDescription] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [icon, setIcon] = useState("");

  const [parentId, setParentId] = useState("");

  const [displayOrder, setDisplayOrder] = useState("0");

  const [isFeatured, setIsFeatured] = useState(false);

  const [isActive, setIsActive] = useState(true);

  const [metaTitle, setMetaTitle] = useState("");

  const [metaDescription, setMetaDescription] = useState("");

  // ============================================================
  // POPULATE EDIT FORM
  // ============================================================

  useEffect(() => {
    if (!category) {
      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
      setIcon("");
      setParentId("");
      setDisplayOrder("0");
      setIsFeatured(false);
      setIsActive(true);
      setMetaTitle("");
      setMetaDescription("");

      return;
    }

    setName(category.name);

    setSlug(category.slug);

    setDescription(category.description ?? "");

    setImageUrl(category.imageUrl ?? "");

    setIcon(category.icon ?? "");

    setParentId(category.parentId ?? "");

    setDisplayOrder(String(category.displayOrder));

    setIsFeatured(category.isFeatured);

    setIsActive(category.isActive);

    setMetaTitle(category.metaTitle ?? "");

    setMetaDescription(category.metaDescription ?? "");
  }, [category]);

  // ============================================================
  // AUTO SLUG
  // ============================================================

  function handleNameChange(value: string) {
    setName(value);

    if (!isEditing) {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setSlug(generatedSlug);
    }
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data: CreateCategoryInput = {
      name: name.trim(),

      slug: slug.trim(),

      ...(description.trim()
        ? {
            description: description.trim(),
          }
        : {}),

      ...(imageUrl.trim()
        ? {
            imageUrl: imageUrl.trim(),
          }
        : {}),

      ...(icon.trim()
        ? {
            icon: icon.trim(),
          }
        : {}),

      parentId: parentId || null,

      displayOrder: Number(displayOrder) || 0,

      isFeatured,

      ...(metaTitle.trim()
        ? {
            metaTitle: metaTitle.trim(),
          }
        : {}),

      ...(metaDescription.trim()
        ? {
            metaDescription: metaDescription.trim(),
          }
        : {}),
    };

    onSubmit(data);
  }

  // ============================================================
  // PARENT OPTIONS
  // ============================================================

  const parentOptions = categories.filter((item) => item.id !== category?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? "Edit Category" : "Add Category"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditing
                ? "Update this category."
                : "Create a new store category."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ======================================================
            FORM
        ======================================================= */}

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category Name
            </label>

            <input
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="e.g. Laptops & Computers"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* SLUG */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Slug
            </label>

            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="laptops-computers"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Lowercase words separated by hyphens.
            </p>
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe this category..."
              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* IMAGE + ICON */}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Image URL
              </label>

              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Icon
              </label>

              <input
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                placeholder="Laptop"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-slate-400">Lucide icon name.</p>
            </div>
          </div>

          {/* PARENT + ORDER */}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Parent Category
              </label>

              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">No parent category</option>

                {parentOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Display Order
              </label>

              <input
                type="number"
                min="0"
                value={displayOrder}
                onChange={(event) => setDisplayOrder(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* STATUS */}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <div>
                <p className="text-sm font-medium text-slate-800">Active</p>

                <p className="text-xs text-slate-400">
                  Show this category in the store.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <div>
                <p className="text-sm font-medium text-slate-800">Featured</p>

                <p className="text-xs text-slate-400">
                  Show in featured category areas.
                </p>
              </div>
            </label>
          </div>

          {/* SEO */}

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">SEO</h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Meta Title
                </label>

                <input
                  value={metaTitle}
                  onChange={(event) => setMetaTitle(event.target.value)}
                  maxLength={160}
                  placeholder="Category SEO title"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Meta Description
                </label>

                <textarea
                  value={metaDescription}
                  onChange={(event) => setMetaDescription(event.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Category SEO description"
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
