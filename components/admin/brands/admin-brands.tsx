"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import {
  useAdminBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/lib/query/brands/admin/admin-brand-hooks";

import type {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/lib/query/brands/brand-types";
import { BrandForm } from "./brand-form";
import { BrandTable } from "./brand-table";

type BrandFormData = {
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  isActive: boolean;
};

export function AdminBrands() {
  // ============================================================
  // GET ADMIN BRANDS
  // ============================================================

  const { data, isLoading, isError, error } = useAdminBrands();

  // ============================================================
  // MUTATIONS
  // ============================================================

  const createBrandMutation = useCreateBrand();

  const updateBrandMutation = useUpdateBrand();

  const deleteBrandMutation = useDeleteBrand();

  // ============================================================
  // UI STATE
  // ============================================================

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // ============================================================
  // API DATA
  // ============================================================

  const brands = data?.data ?? [];

  // ============================================================
  // FILTER BRANDS
  // ============================================================

  const filteredBrands = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return brands.filter((brand) => {
      const matchesSearch =
        searchValue === "" ||
        brand.name.toLowerCase().includes(searchValue) ||
        brand.slug.toLowerCase().includes(searchValue);

      const matchesStatus =
        status === "all" ||
        (status === "active" && brand.isActive) ||
        (status === "inactive" && !brand.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [brands, search, status]);

  // ============================================================
  // OPEN CREATE
  // ============================================================

  function handleAddBrand() {
    setEditingBrand(null);
    setIsFormOpen(true);
  }

  // ============================================================
  // OPEN EDIT
  // ============================================================

  function handleEditBrand(brand: Brand) {
    setEditingBrand(brand);
    setIsFormOpen(true);
  }

  // ============================================================
  // CLOSE FORM
  // ============================================================

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingBrand(null);
  }

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  async function handleSubmit(formData: BrandFormData) {
    try {
      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------

      if (!editingBrand) {
        const createData: CreateBrandInput = {
          name: formData.name,
          slug: formData.slug,
          ...(formData.logoUrl ? { logoUrl: formData.logoUrl } : {}),
          ...(formData.description
            ? { description: formData.description }
            : {}),
          ...(formData.website ? { website: formData.website } : {}),
        };

        await createBrandMutation.mutateAsync(createData);

        handleCloseForm();

        return;
      }

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      const updateData: UpdateBrandInput = {
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl,
        description: formData.description,
        website: formData.website,
        isActive: formData.isActive,
      };

      await updateBrandMutation.mutateAsync({
        slug: editingBrand.slug,
        data: updateData,
      });

      handleCloseForm();
    } catch {
      // Mutation errors are displayed in the UI.
    }
  }

  // ============================================================
  // DEACTIVATE
  // ============================================================

  async function handleDeleteBrand(brand: Brand) {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${brand.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBrandMutation.mutateAsync(brand.slug);
    } catch {
      // Mutation errors are displayed in the UI.
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">Brands</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the brands available in your store.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">Loading brands...</p>
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
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">Brands</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the brands available in your store.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">
            Failed to load brands.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B1F3B]">Brands</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the brands available in your store.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddBrand}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Brand
        </button>
      </div>

      {/* ======================================================
          MUTATION ERROR
      ======================================================= */}

      {(createBrandMutation.isError ||
        updateBrandMutation.isError ||
        deleteBrandMutation.isError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {createBrandMutation.error instanceof Error
              ? createBrandMutation.error.message
              : updateBrandMutation.error instanceof Error
                ? updateBrandMutation.error.message
                : deleteBrandMutation.error instanceof Error
                  ? deleteBrandMutation.error.message
                  : "Brand operation failed."}
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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by brand name or slug..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* STATUS */}

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | "active" | "inactive")
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Brands</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ======================================================
          SUMMARY CARDS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* TOTAL */}

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Brands
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {brands.length}
          </p>
        </div>

        {/* ACTIVE */}

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {brands.filter((brand) => brand.isActive).length}
          </p>
        </div>

        {/* INACTIVE */}

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-500">
            {brands.filter((brand) => !brand.isActive).length}
          </p>
        </div>
      </div>

      {/* ======================================================
          BRAND TABLE
      ======================================================= */}

      <BrandTable
        brands={filteredBrands}
        onEdit={handleEditBrand}
        onDelete={handleDeleteBrand}
        deletingSlug={
          deleteBrandMutation.isPending
            ? deleteBrandMutation.variables
            : undefined
        }
      />

      {/* ======================================================
          FORM
      ======================================================= */}

      {isFormOpen && (
        <BrandForm
          brand={editingBrand}
          isSubmitting={
            createBrandMutation.isPending || updateBrandMutation.isPending
          }
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
