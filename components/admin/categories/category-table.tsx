"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Category } from "@/lib/query/categories/category-types";

type CategoryTableProps = {
  categories: Category[];
  allCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  deletingSlug?: string;
};

export function CategoryTable({
  categories,
  allCategories,
  onEdit,
  onDelete,
  deletingSlug,
}: CategoryTableProps) {
  // ============================================================
  // GET PARENT NAME
  // ============================================================

  function getParentName(
    parentId: string | null,
  ) {
    if (!parentId) {
      return "Root category";
    }

    const parent = allCategories.find(
      (category) =>
        category.id === parentId,
    );

    return parent?.name ?? "Unknown";
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Categories
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {categories.length}{" "}
          {categories.length === 1
            ? "category"
            : "categories"}{" "}
          currently shown
        </p>
      </div>

      {/* ======================================================
          DESKTOP
      ======================================================= */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[950px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-16 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                S/N
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Slug
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Parent
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {categories.map(
              (category, index) => {
                const isDeleting =
                  deletingSlug ===
                  category.slug;

                return (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    {/* S/N */}

                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-400">
                        {index + 1}
                      </span>
                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
                          {category.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {category.name}
                          </p>

                          {category.isFeatured && (
                            <span className="mt-1 inline-block text-[10px] font-medium text-blue-600">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SLUG */}

                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-slate-500">
                        {category.slug}
                      </span>
                    </td>

                    {/* PARENT */}

                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">
                        {getParentName(
                          category.parentId,
                        )}
                      </span>
                    </td>

                    {/* ORDER */}

                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">
                        {category.displayOrder}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-4">
                      {category.isActive ? (
                        <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(category)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit category"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            onDelete(category)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Deactivate category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                          title="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          MOBILE
      ======================================================= */}

      <div className="divide-y divide-slate-100 lg:hidden">
        {categories.map(
          (category, index) => {
            const isDeleting =
              deletingSlug ===
              category.slug;

            return (
              <div
                key={category.id}
                className="p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="pt-1 text-xs font-semibold text-slate-400">
                    {index + 1}
                  </span>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {category.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {category.name}
                        </p>

                        <p className="mt-1 truncate font-mono text-[11px] text-slate-400">
                          {category.slug}
                        </p>
                      </div>

                      {category.isFeatured && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Parent
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                          {getParentName(
                            category.parentId,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Order
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                          {category.displayOrder}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Status
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                          {category.isActive
                            ? "Active"
                            : "Inactive"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Slug
                        </p>

                        <p className="mt-1 truncate font-mono text-xs text-slate-700">
                          {category.slug}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onEdit(category)
                        }
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          onDelete(category)
                        }
                        className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting
                          ? "Deactivating..."
                          : "Deactivate"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* ======================================================
          EMPTY STATE
      ======================================================= */}

      {categories.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            No categories found
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Add your first category to get started.
          </p>
        </div>
      )}
    </div>
  );
}