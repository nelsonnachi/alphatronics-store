"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ProductBasicInfo } from "./product-basic-info";
import { ProductPricing } from "./product-pricing";
import { ProductInventory } from "./product-inventory";
import { ProductImages } from "./product-images";
import { ProductSpecifications } from "./product-specifications";
import { ProductVariants } from "./product-variants";
import { ProductSeo } from "./product-seo";
import { ProductStatus } from "./product-status";

import { useCreateProduct } from "@/lib/query/products/admin/admin-product-hooks";

// ============================================================
// FORM TYPES
// ============================================================

export type ProductImageForm = {
  id: string;
  file: File | null;
  preview: string;
  altText: string;
  isPrimary: boolean;
  isExisting?: boolean;
};

export type ProductSpecificationForm = {
  id: string;
  group: string;
  key: string;
  value: string;
};

export type ProductVariantForm = {
  id: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  imageFile: File | null;
  imagePreview: string;
  attributes: {
    key: string;
    value: string;
  }[];
  isExisting?: boolean;
};

// ============================================================
// ADD PRODUCT FORM
// ============================================================

export function AddProductForm() {
  const router = useRouter();

  // ==========================================================
  // CREATE PRODUCT MUTATION
  // ==========================================================

  const createProductMutation = useCreateProduct();

  // ==========================================================
  // BASIC INFORMATION
  // ==========================================================

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // ==========================================================
  // PRICING
  // ==========================================================

  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");

  // ==========================================================
  // INVENTORY
  // ==========================================================

  const [stock, setStock] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  const [warrantyMonths, setWarrantyMonths] = useState("12");
  const [weightKg, setWeightKg] = useState("");

  // ==========================================================
  // PRODUCT STATUS
  // ==========================================================

  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // ==========================================================
  // SEO
  // ==========================================================

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // ==========================================================
  // IMAGES
  // ==========================================================

  const [images, setImages] = useState<ProductImageForm[]>([]);

  // ==========================================================
  // SPECIFICATIONS
  // ==========================================================

  const [specifications, setSpecifications] = useState<
    ProductSpecificationForm[]
  >([]);

  // ==========================================================
  // VARIANTS
  // ==========================================================

  const [variants, setVariants] = useState<ProductVariantForm[]>([]);

  // ==========================================================
  // SUBMIT PRODUCT
  // ==========================================================

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // --------------------------------------------------------
    // STEP 1: Build product image metadata
    // --------------------------------------------------------

    const productImagesData = images.map((image, index) => ({
      fileKey: `image-${index}`,
      altText: image.altText || undefined,
      isPrimary: image.isPrimary,
    }));

    // --------------------------------------------------------
    // STEP 2: Build variant metadata
    // --------------------------------------------------------

    const variantsData = variants.map((variant, index) => {
      const attributes: Record<string, string> = {};

      for (const attribute of variant.attributes) {
        const key = attribute.key.trim();
        const value = attribute.value.trim();

        if (key && value) {
          attributes[key] = value;
        }
      }

      return {
        name: variant.name,
        sku: variant.sku,

        price: variant.price || undefined,

        compareAtPrice:
          variant.compareAtPrice || undefined,

        stock: variant.stock,

        imageFileKey: variant.imageFile
          ? `variant-image-${index}`
          : undefined,

        attributes,
      };
    });

    // --------------------------------------------------------
    // STEP 3: Build the JSON product data
    //
    // IMPORTANT:
    // We do NOT put the actual File objects here.
    // The API expects the files separately in FormData.
    // --------------------------------------------------------

    const productData = {
      name,
      slug,
      sku,

      categoryId,

      // Brand is optional in the backend.
      // Do not send an empty string.
      brandId: brandId || undefined,

      description,

      shortDescription:
        shortDescription || undefined,

      price,

      compareAtPrice:
        compareAtPrice || undefined,

      costPrice:
        costPrice || undefined,

      currency: "NGN",

      stock,

      lowStockThreshold,

      warrantyMonths,

      weightKg:
        weightKg || undefined,

      isFeatured,

      isNewArrival,

      isBestSeller,

      isActive,

      metaTitle:
        metaTitle || undefined,

      metaDescription:
        metaDescription || undefined,

      images: productImagesData,

      specifications: specifications.map(
        (specification) => ({
          group: specification.group,
          key: specification.key,
          value: specification.value,
        }),
      ),

      variants: variantsData,
    };

    // --------------------------------------------------------
    // STEP 4: Create multipart FormData
    // --------------------------------------------------------

    const formData = new FormData();

    // Backend expects this exact field name.
    formData.append(
      "productData",
      JSON.stringify(productData),
    );

    // --------------------------------------------------------
    // STEP 5: Add product image files
    // --------------------------------------------------------

    images.forEach((image, index) => {
      if (image.file) {
        formData.append(
          `image-${index}`,
          image.file,
        );
      }
    });

    // --------------------------------------------------------
    // STEP 6: Add variant image files
    // --------------------------------------------------------

    variants.forEach((variant, index) => {
      if (variant.imageFile) {
        formData.append(
          `variant-image-${index}`,
          variant.imageFile,
        );
      }
    });

    // --------------------------------------------------------
    // STEP 7: Send to API through TanStack Query
    // --------------------------------------------------------

    createProductMutation.mutate(formData, {
      onSuccess: (response) => {
        console.log(
          "Product created successfully:",
          response,
        );

        alert("Product created successfully!");

        // Go back to the product list.
        router.push("/admin/products");
      },

      onError: (error) => {
        console.error(
          "Create product failed:",
          error,
        );

        alert(
          error instanceof Error
            ? error.message
            : "Failed to create product.",
        );
      },
    });
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <form onSubmit={handleSubmit}>
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to products
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={createProductMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createProductMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />

              Save Product
            </>
          )}
        </button>
      </div>

      {/* ======================================================
          FORM CONTENT
      ======================================================= */}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ====================================================
            LEFT
        ===================================================== */}

        <div className="space-y-6">
          {/* BASIC INFORMATION */}

          <ProductBasicInfo
            name={name}
            slug={slug}
            sku={sku}
            categoryId={categoryId}
            brandId={brandId}
            description={description}
            shortDescription={shortDescription}
            onNameChange={setName}
            onSlugChange={setSlug}
            onSkuChange={setSku}
            onCategoryChange={setCategoryId}
            onBrandChange={setBrandId}
            onDescriptionChange={setDescription}
            onShortDescriptionChange={
              setShortDescription
            }
          />

          {/* PRICING */}

          <ProductPricing
            price={price}
            compareAtPrice={compareAtPrice}
            costPrice={costPrice}
            onPriceChange={setPrice}
            onCompareAtPriceChange={
              setCompareAtPrice
            }
            onCostPriceChange={setCostPrice}
          />

          {/* INVENTORY */}

          <ProductInventory
            stock={stock}
            lowStockThreshold={
              lowStockThreshold
            }
            warrantyMonths={warrantyMonths}
            weightKg={weightKg}
            onStockChange={setStock}
            onLowStockThresholdChange={
              setLowStockThreshold
            }
            onWarrantyMonthsChange={
              setWarrantyMonths
            }
            onWeightKgChange={setWeightKg}
          />

          {/* IMAGES */}

          <ProductImages
            images={images}
            onImagesChange={setImages}
          />

          {/* SPECIFICATIONS */}

          <ProductSpecifications
            specifications={specifications}
            onSpecificationsChange={
              setSpecifications
            }
          />

          {/* VARIANTS */}

          <ProductVariants
            variants={variants}
            onVariantsChange={setVariants}
          />

          {/* SEO */}

          <ProductSeo
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={
              setMetaDescription
            }
          />
        </div>

        {/* ====================================================
            RIGHT SIDEBAR
        ===================================================== */}

        <div>
          <ProductStatus
            isFeatured={isFeatured}
            isNewArrival={isNewArrival}
            isBestSeller={isBestSeller}
            isActive={isActive}
            onFeaturedChange={setIsFeatured}
            onNewArrivalChange={setIsNewArrival}
            onBestSellerChange={
              setIsBestSeller
            }
            onActiveChange={setIsActive}
          />
        </div>
      </div>

      {/* ======================================================
          BOTTOM SAVE
      ======================================================= */}

      <div className="mt-6 flex justify-end border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={createProductMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createProductMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Saving Product...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />

              Save Product
            </>
          )}
        </button>
      </div>

      {/* ======================================================
          ERROR MESSAGE
      ======================================================= */}

      {createProductMutation.isError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {createProductMutation.error instanceof Error
            ? createProductMutation.error.message
            : "Failed to create product."}
        </div>
      )}
    </form>
  );
}