"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

import { ProductStatusBadge } from "./product-status-badge";

import type { Product } from "@/lib/query/products/product-types";

import { useDeleteProduct } from "@/lib/query/products/admin/admin-product-hooks";

type ProductTableProps = {
  products: Product[];
};

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function ProductTable({ products }: ProductTableProps) {
  const deleteProductMutation = useDeleteProduct();

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  function handleDeleteProduct(slug: string, productName: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`,
    );

    if (!confirmed) {
      return;
    }

    deleteProductMutation.mutate(slug);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* =====================================================
          TABLE HEADER / PRODUCT COUNT
      ====================================================== */}

      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Products</h2>

          <p className="mt-1 text-xs text-slate-500">
            {products.length} {products.length === 1 ? "product" : "products"}{" "}
            currently shown
          </p>
        </div>
      </div>

      {/* =====================================================
          DELETE ERROR
      ====================================================== */}

      {deleteProductMutation.isError && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-3">
          <p className="text-sm text-red-600">
            {deleteProductMutation.error instanceof Error
              ? deleteProductMutation.error.message
              : "Failed to delete product."}
          </p>
        </div>
      )}

      {/* =====================================================
          DESKTOP TABLE
      ====================================================== */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1100px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {/* S/N */}

              <th className="w-16 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                S/N
              </th>

              {/* PRODUCT */}

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Product
              </th>

              {/* SKU */}

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                SKU
              </th>

              {/* CATEGORY */}

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>

              {/* PRICE */}

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Price
              </th>

              {/* STOCK */}

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stock
              </th>

              {/* STATUS */}

              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              {/* ACTIONS */}

              <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.map((product, index) => {
              const primaryImage =
                product.images.find((image) => image.isPrimary) ??
                product.images[0];

              const isDeleting =
                deleteProductMutation.isPending &&
                deleteProductMutation.variables === product.slug;

              return (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* =================================================
                      S/N
                  ================================================== */}

                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-400">
                      {index + 1}
                    </span>
                  </td>

                  {/* =================================================
                      PRODUCT
                  ================================================== */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* IMAGE */}

                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={primaryImage.altText ?? product.name}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* NAME */}

                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.slug}/edit`}
                          className="block max-w-[260px] truncate text-sm font-semibold text-slate-800 hover:text-blue-600"
                        >
                          {product.name}
                        </Link>

                        <div className="mt-1 flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <span className="text-[10px] font-medium text-blue-600">
                              Featured
                            </span>
                          )}

                          {product.isNewArrival && (
                            <span className="text-[10px] font-medium text-green-600">
                              New
                            </span>
                          )}

                          {product.isBestSeller && (
                            <span className="text-[10px] font-medium text-orange-600">
                              Best Seller
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* =================================================
                      SKU
                  ================================================== */}

                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-slate-600">
                      {product.sku}
                    </span>
                  </td>

                  {/* =================================================
                      CATEGORY
                  ================================================== */}

                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">
                      {product.category?.name ?? "—"}
                    </span>
                  </td>

                  {/* =================================================
                      PRICE
                  ================================================== */}

                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {formatPrice(product.price)}
                      </p>

                      {product.compareAtPrice && (
                        <p className="text-xs text-slate-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* =================================================
                      STOCK
                  ================================================== */}

                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {product.stock}
                      </p>

                      {product.reservedStock > 0 && (
                        <p className="text-xs text-slate-400">
                          {product.reservedStock} reserved
                        </p>
                      )}
                    </div>
                  </td>

                  {/* =================================================
                      STATUS
                  ================================================== */}

                  <td className="px-4 py-4">
                    <ProductStatusBadge product={product} />
                  </td>

                  {/* =================================================
                      ACTIONS
                  ================================================== */}

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      {/* VIEW */}

                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        title="View product"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {/* EDIT */}

                      <Link
                        href={`/admin/products/${product.slug}/edit`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      {/* DELETE */}

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          handleDeleteProduct(product.slug, product.name)
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* MORE */}

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

      {/* =====================================================
          MOBILE / TABLET CARDS
      ====================================================== */}

      <div className="divide-y divide-slate-100 lg:hidden">
        {products.map((product, index) => {
          const primaryImage =
            product.images.find((image) => image.isPrimary) ??
            product.images[0];

          const isDeleting =
            deleteProductMutation.isPending &&
            deleteProductMutation.variables === product.slug;

          return (
            <div key={product.id} className="p-4 sm:p-5">
              <div className="flex gap-3">
                {/* S/N */}

                <div className="flex w-6 shrink-0 items-start justify-center pt-1">
                  <span className="text-xs font-semibold text-slate-400">
                    {index + 1}
                  </span>
                </div>

                {/* IMAGE */}

                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.altText ?? product.name}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/products/${product.slug}/edit`}
                      className="text-sm font-semibold text-slate-800 hover:text-blue-600"
                    >
                      {product.name}
                    </Link>

                    <button
                      type="button"
                      className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                      title="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-1 font-mono text-[11px] text-slate-400">
                    {product.sku}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {formatPrice(product.price)}
                    </span>

                    <ProductStatusBadge product={product} />
                  </div>
                </div>
              </div>

              {/* =================================================
                  MOBILE DETAILS
              ================================================== */}

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-4">
                {/* CATEGORY */}

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {product.category?.name ?? "—"}
                  </p>
                </div>

                {/* STOCK */}

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Stock
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {product.stock}
                  </p>
                </div>

                {/* SOLD */}

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Sold
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {product.soldCount}
                  </p>
                </div>

                {/* REVIEWS */}

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Reviews
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {product.reviewCount}
                  </p>
                </div>
              </div>

              {/* =================================================
                  MOBILE ACTIONS
              ================================================== */}

              <div className="mt-3 flex gap-2">
                {/* EDIT */}

                <Link
                  href={`/admin/products/${product.slug}/edit`}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </Link>

                {/* VIEW */}

                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  View
                </Link>

                {/* DELETE */}

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    handleDeleteProduct(product.slug, product.name)
                  }
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {products.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            No products found
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Try changing your filters or add a new product.
          </p>
        </div>
      )}
    </div>
  );
}
