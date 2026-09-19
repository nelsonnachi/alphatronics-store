"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/query/categories/admin/admin-category-hooks";

import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/query/categories/category-types";

import { CategoryTable } from "./category-table";
import { CategoryForm } from "./category-form";

export function AdminCategories() {
  // ============================================================
  // GET CATEGORIES
  // ============================================================

  const {
    data,
    isLoading,
    isError,
    error,
  } = useAdminCategories();

  // ============================================================
  // MUTATIONS
  // ============================================================

  const createCategoryMutation =
    useCreateCategory();

  const updateCategoryMutation =
    useUpdateCategory();

  const deleteCategoryMutation =
    useDeleteCategory();

  // ============================================================
  // UI STATE
  // ============================================================

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  // ============================================================
  // API DATA
  // ============================================================

  const categories = data?.data ?? [];

  // ============================================================
  // FILTER CATEGORIES
  // ============================================================

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        search.trim() === "" ||
        category.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        category.slug
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        (status === "active" &&
          category.isActive) ||
        (status === "inactive" &&
          !category.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    categories,
    search,
    status,
  ]);

  // ============================================================
  // OPEN CREATE FORM
  // ============================================================

  function handleAddCategory() {
    setEditingCategory(null);
    setIsFormOpen(true);
  }

  // ============================================================
  // OPEN EDIT FORM
  // ============================================================

  function handleEditCategory(
    category: Category,
  ) {
    setEditingCategory(category);
    setIsFormOpen(true);
  }

  // ============================================================
  // CLOSE FORM
  // ============================================================

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingCategory(null);
  }

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  async function handleSubmit(
    formData: CreateCategoryInput,
  ) {
    try {
      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------

      if (!editingCategory) {
        await createCategoryMutation.mutateAsync(
          formData,
        );

        handleCloseForm();

        return;
      }

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      const updateData: UpdateCategoryInput = {
        ...formData,
      };

      await updateCategoryMutation.mutateAsync({
        slug: editingCategory.slug,
        data: updateData,
      });

      handleCloseForm();
    } catch {
      // Mutation errors are displayed below.
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDeleteCategory(
    category: Category,
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(
        category.slug,
      );
    } catch {
      // Error is displayed below.
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your store categories.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading categories...
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your store categories.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">
            Failed to load categories.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Something went wrong."}
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <section className="space-y-6">
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the categories used across your store.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCategory}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* ======================================================
          MUTATION ERROR
      ======================================================= */}

      {(createCategoryMutation.isError ||
        updateCategoryMutation.isError ||
        deleteCategoryMutation.isError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {createCategoryMutation.error instanceof
            Error
              ? createCategoryMutation.error.message
              : updateCategoryMutation.error instanceof
                  Error
                ? updateCategoryMutation.error.message
                : deleteCategoryMutation.error instanceof
                    Error
                  ? deleteCategoryMutation.error.message
                  : "Category operation failed."}
          </p>
        </div>
      )}

      {/* ======================================================
          FILTERS
      ======================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* STATUS */}

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | "all"
                  | "active"
                  | "inactive",
              )
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">
              All Categories
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Categories
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {categories.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              categories.filter(
                (category) =>
                  category.isActive,
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Featured
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {
              categories.filter(
                (category) =>
                  category.isFeatured,
              ).length
            }
          </p>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}

      <CategoryTable
        categories={filteredCategories}
        allCategories={categories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        deletingSlug={
          deleteCategoryMutation.isPending
            ? deleteCategoryMutation.variables
            : undefined
        }
      />

      {/* ======================================================
          FORM
      ======================================================= */}

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          categories={categories}
          isSubmitting={
            createCategoryMutation.isPending ||
            updateCategoryMutation.isPending
          }
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}