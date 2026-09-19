"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useProducts } from "@/lib/query/products/product-hooks";
import { useCategories } from "@/lib/query/categories/category-hooks";
import { useBrands } from "@/lib/query/brands/brand-hooks";

import { ShopFilters } from "./shop-filters";
import { ShopToolbar } from "./shop-toolbar";
import { ProductGrid } from "./product-grid";
import { ShopPagination } from "./shop-pagination";
import { ProductList } from "./product-list";

import type {
  ShopFiltersState,
  ShopSort,
  ShopView,
} from "./shop-types";

import {
  defaultShopFilters,
} from "./shop-types";

export function ShopPage() {
  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const productsPerPage = 12;

  // ==========================================================
  // VIEW
  // ==========================================================

  const [view, setView] =
    useState<ShopView>("grid");

  // ==========================================================
  // SORT
  // ==========================================================

  const [sort, setSort] =
    useState<ShopSort>("newest");

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [filters, setFilters] =
    useState<ShopFiltersState>(
      defaultShopFilters,
    );

  // ==========================================================
  // MOBILE FILTER DRAWER
  // ==========================================================

  const [isFilterOpen, setIsFilterOpen] =
    useState(false);

  // ==========================================================
  // BUILD PRODUCT API QUERY
  // ==========================================================

  const productQuery = useMemo(() => {
    return {
      page: currentPage,

      limit: productsPerPage,

      category:
        filters.categories.length > 0
          ? filters.categories.join(",")
          : undefined,

      brand:
        filters.brands.length > 0
          ? filters.brands.join(",")
          : undefined,

      minPrice:
        filters.minPrice !== ""
          ? Number(filters.minPrice)
          : undefined,

      maxPrice:
        filters.maxPrice !== ""
          ? Number(filters.maxPrice)
          : undefined,

      minRating:
        filters.minRating !== null
          ? filters.minRating
          : undefined,

      inStock: filters.inStock
        ? true
        : undefined,

      sort,
    };
  }, [
    currentPage,
    filters,
    sort,
  ]);

  // ==========================================================
  // GET PRODUCTS
  // ==========================================================

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useProducts(productQuery);

  // ==========================================================
  // GET CATEGORIES
  // ==========================================================

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories();

  // ==========================================================
  // GET BRANDS
  // ==========================================================

  const {
    data: brandsData,
    isLoading: isBrandsLoading,
    isError: isBrandsError,
  } = useBrands();

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const products = data?.data ?? [];

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories = useMemo(() => {
    return (
      categoriesData?.data?.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })) ?? []
    );
  }, [categoriesData]);

  // ==========================================================
  // BRANDS
  // ==========================================================

  const brands = useMemo(() => {
    return (
      brandsData?.data?.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
      })) ?? []
    );
  }, [brandsData]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const pagination = data?.pagination;

  const totalProducts =
    pagination?.total ?? 0;

  const totalPages =
    pagination?.totalPages ?? 0;

  // ==========================================================
  // RESET PAGE WHEN FILTERS OR SORT CHANGE
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  function handleClearFilters() {
    setFilters(defaultShopFilters);
    setCurrentPage(1);
  }

  // ==========================================================
  // FILTER CHANGE
  // ==========================================================

  function handleFiltersChange(
    newFilters: ShopFiltersState,
  ) {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  // ==========================================================
  // SORT CHANGE
  // ==========================================================

  function handleSortChange(
    newSort: ShopSort,
  ) {
    setSort(newSort);
    setCurrentPage(1);
  }

  // ==========================================================
  // VIEW CHANGE
  // ==========================================================

  function handleViewChange(
    newView: ShopView,
  ) {
    setView(newView);
  }

  // ==========================================================
  // INITIAL PRODUCT LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <main className="bg-[#F8FAFC]">
        <section className="mx-auto max-w-360 px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-10 text-center">
            <p className="text-sm font-semibold text-[#0F172A]">
              Loading products...
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              Please wait while we load the catalog.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ==========================================================
  // PRODUCT ERROR
  // ==========================================================

  if (isError) {
    return (
      <main className="bg-[#F8FAFC]">
        <section className="mx-auto max-w-360 px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-red-600">
              Failed to load products
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              {error instanceof Error
                ? error.message
                : "Something went wrong."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#F8FAFC]">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="mx-auto max-w-360 px-4 pb-5 pt-5 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}

        <div className="mb-4 flex items-center gap-2 text-[10px] text-[#94A3B8]">
          <span>Home</span>

          <span>/</span>

          <span className="font-medium text-[#475569]">
            Shop
          </span>
        </div>

        <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">
          Shop All Products
        </h1>

        <p className="mt-1 text-xs text-[#94A3B8]">
          Browse our full electronics catalog
        </p>
      </section>

      {/* =====================================================
          SHOP CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-360 px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* =================================================
              DESKTOP FILTER SIDEBAR
          ================================================= */}

          <div className="hidden lg:block">
            <ShopFilters
              filters={filters}
              categories={categories}
              brands={brands}
              onFiltersChange={
                handleFiltersChange
              }
              onClear={handleClearFilters}
            />
          </div>

          {/* =================================================
              PRODUCT AREA
          ================================================= */}

          <div className="min-w-0">
            <ShopToolbar
              totalProducts={totalProducts}
              currentPage={currentPage}
              productsPerPage={
                productsPerPage
              }
              view={view}
              onViewChange={
                handleViewChange
              }
              sort={sort}
              onSortChange={
                handleSortChange
              }
              onFilterOpen={() =>
                setIsFilterOpen(true)
              }
            />

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div
              className={`mt-3 ${
                isFetching
                  ? "opacity-60"
                  : ""
              }`}
            >
              {view === "grid" ? (
                <ProductGrid
                  products={products}
                />
              ) : (
                <ProductList
                  products={products}
                />
              )}
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <ShopPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={
                setCurrentPage
              }
            />
          </div>
        </div>
      </section>

      {/* =======================================================
          MOBILE FILTER DRAWER
      ======================================================= */}

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setIsFilterOpen(false)
            }
            className="absolute inset-0 bg-black/40"
          />

          {/* DRAWER */}

          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-[#F8FAFC] p-4 shadow-xl sm:max-w-md">
            <ShopFilters
              filters={filters}
              categories={categories}
              brands={brands}
              onFiltersChange={
                handleFiltersChange
              }
              onClear={handleClearFilters}
              onClose={() =>
                setIsFilterOpen(false)
              }
            />
          </div>
        </div>
      )}
    </main>
  );
}