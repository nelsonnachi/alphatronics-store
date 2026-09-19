"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Brand } from "@/lib/query/brands/brand-types";

type BrandTableProps = {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  deletingSlug?: string;
};

export function BrandTable({
  brands,
  onEdit,
  onDelete,
  deletingSlug,
}: BrandTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* ======================================================
          TABLE HEADER
      ======================================================= */}

      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Brands
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {brands.length}{" "}
            {brands.length === 1
              ? "brand"
              : "brands"}{" "}
            currently shown
          </p>
        </div>
      </div>

      {/* ======================================================
          DESKTOP TABLE
      ======================================================= */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[950px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-16 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                S/N
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Brand
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Slug
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Website
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
            {brands.map((brand, index) => {
              const isDeleting =
                deletingSlug === brand.slug;

              return (
                <tr
                  key={brand.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* S/N */}

                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-400">
                      {index + 1}
                    </span>
                  </td>

                  {/* BRAND */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* LOGO */}

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {brand.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          <span className="text-sm font-bold text-blue-600">
                            {brand.name
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* NAME */}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {brand.name}
                        </p>

                        {brand.description && (
                          <p className="mt-1 max-w-[300px] truncate text-xs text-slate-400">
                            {brand.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SLUG */}

                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-slate-500">
                      {brand.slug}
                    </span>
                  </td>

                  {/* WEBSITE */}

                  <td className="px-4 py-4">
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="block max-w-[220px] truncate text-sm text-blue-600 hover:underline"
                      >
                        {brand.website}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* STATUS */}

                  <td className="px-4 py-4">
                    {brand.isActive ? (
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
                        onClick={() => onEdit(brand)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        title="Edit brand"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          onDelete(brand)
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Deactivate brand"
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
            })}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          MOBILE
      ======================================================= */}

      <div className="divide-y divide-slate-100 lg:hidden">
        {brands.map((brand, index) => {
          const isDeleting =
            deletingSlug === brand.slug;

          return (
            <div
              key={brand.id}
              className="p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                {/* S/N */}

                <span className="pt-1 text-xs font-semibold text-slate-400">
                  {index + 1}
                </span>

                {/* LOGO */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {brand.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-sm font-bold text-blue-600">
                      {brand.name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {brand.name}
                      </p>

                      <p className="mt-1 truncate font-mono text-[11px] text-slate-400">
                        {brand.slug}
                      </p>
                    </div>

                    {brand.isActive ? (
                      <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600">
                        Active
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* DESCRIPTION */}

                  {brand.description && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                      {brand.description}
                    </p>
                  )}

                  {/* WEBSITE */}

                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block truncate text-xs text-blue-600 hover:underline"
                    >
                      {brand.website}
                    </a>
                  )}

                  {/* ACTIONS */}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(brand)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() =>
                        onDelete(brand)
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
        })}
      </div>

      {/* ======================================================
          EMPTY STATE
      ======================================================= */}

      {brands.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            No brands found
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Add your first brand to get started.
          </p>
        </div>
      )}
    </div>
  );
}