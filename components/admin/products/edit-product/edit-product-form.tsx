"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAdminProduct,
  useUpdateProduct,
} from "@/lib/query/products/admin/admin-product-hooks";
import { ProductBasicInfo } from "../add-products/product-basic-info";
import { ProductPricing } from "../add-products/product-pricing";
import { ProductInventory } from "../add-products/product-inventory";
import { ProductImages } from "../add-products/product-images";
import { ProductSpecifications } from "../add-products/product-specifications";
import { ProductVariants } from "../add-products/product-variants";
import { ProductSeo } from "../add-products/product-seo";
import { ProductStatus } from "../add-products/product-status";

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

export type ProductVariantAttributeForm = {
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

  attributes: ProductVariantAttributeForm[];

  isExisting?: boolean;
};

// ============================================================
// PROPS
// ============================================================

type EditProductFormProps = {
  slug: string;
};

// ============================================================
// COMPONENT
// ============================================================

export function EditProductForm({ slug }: EditProductFormProps) {
  const router = useRouter();

  // ============================================================
  // GET PRODUCT
  // ============================================================

  const { data, isLoading, isError, error } = useAdminProduct(slug);

  // ============================================================
  // UPDATE PRODUCT
  // ============================================================

  const updateProductMutation = useUpdateProduct();

  // ============================================================
  // BASIC INFORMATION
  // ============================================================

  const [name, setName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [sku, setSku] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const [brandId, setBrandId] = useState("");

  const [description, setDescription] = useState("");

  const [shortDescription, setShortDescription] = useState("");

  // ============================================================
  // PRICING
  // ============================================================

  const [price, setPrice] = useState("");

  const [compareAtPrice, setCompareAtPrice] = useState("");

  const [costPrice, setCostPrice] = useState("");

  // ============================================================
  // INVENTORY
  // ============================================================

  const [stock, setStock] = useState("0");

  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  const [warrantyMonths, setWarrantyMonths] = useState("12");

  const [weightKg, setWeightKg] = useState("");

  // ============================================================
  // STATUS
  // ============================================================

  const [isFeatured, setIsFeatured] = useState(false);

  const [isNewArrival, setIsNewArrival] = useState(false);

  const [isBestSeller, setIsBestSeller] = useState(false);

  const [isActive, setIsActive] = useState(true);

  // ============================================================
  // SEO
  // ============================================================

  const [metaTitle, setMetaTitle] = useState("");

  const [metaDescription, setMetaDescription] = useState("");

  // ============================================================
  // IMAGES
  // ============================================================

  const [images, setImages] = useState<ProductImageForm[]>([]);

  // ============================================================
  // SPECIFICATIONS
  // ============================================================

  const [specifications, setSpecifications] = useState<
    ProductSpecificationForm[]
  >([]);

  // ============================================================
  // VARIANTS
  // ============================================================

  const [variants, setVariants] = useState<ProductVariantForm[]>([]);

  // ============================================================
  // POPULATE FORM
  // ============================================================

  useEffect(() => {
    if (!data?.data) {
      return;
    }

    const product = data.data;

    // ----------------------------------------------------------
    // BASIC INFORMATION
    // ----------------------------------------------------------

    setName(product.name);

    setProductSlug(product.slug);

    setSku(product.sku);

    setCategoryId(product.categoryId);

    setBrandId(product.brandId ?? "");

    setDescription(product.description);

    setShortDescription(product.shortDescription ?? "");

    // ----------------------------------------------------------
    // PRICING
    // ----------------------------------------------------------

    setPrice(product.price);

    setCompareAtPrice(product.compareAtPrice ?? "");

    setCostPrice(product.costPrice ?? "");

    // ----------------------------------------------------------
    // INVENTORY
    // ----------------------------------------------------------

    setStock(String(product.stock));

    setLowStockThreshold(String(product.lowStockThreshold));

    setWarrantyMonths(String(product.warrantyMonths));

    setWeightKg(product.weightKg ?? "");

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    setIsFeatured(product.isFeatured);

    setIsNewArrival(product.isNewArrival);

    setIsBestSeller(product.isBestSeller);

    setIsActive(product.isActive);

    // ----------------------------------------------------------
    // SEO
    // ----------------------------------------------------------

    setMetaTitle(product.metaTitle ?? "");

    setMetaDescription(product.metaDescription ?? "");

    // ----------------------------------------------------------
    // EXISTING IMAGES
    // ----------------------------------------------------------

    setImages(
      product.images.map((image) => ({
        id: image.id,

        file: null,

        preview: image.url,

        altText: image.altText ?? "",

        isPrimary: image.isPrimary,

        isExisting: true,
      })),
    );

    // ----------------------------------------------------------
    // EXISTING SPECIFICATIONS
    // ----------------------------------------------------------

    setSpecifications(
      product.specifications.map((specification) => ({
        id: specification.id,

        group: specification.group,

        key: specification.key,

        value: specification.value,
      })),
    );

    // ----------------------------------------------------------
    // EXISTING VARIANTS
    // ----------------------------------------------------------

    setVariants(
      product.variants.map((variant) => ({
        id: variant.id,

        name: variant.name,

        sku: variant.sku,

        price: variant.price ?? "",

        compareAtPrice: variant.compareAtPrice ?? "",

        stock: String(variant.stock),

        imageFile: null,

        imagePreview: variant.imageUrl ?? "",

        attributes: Object.entries(variant.attributes ?? {}).map(
          ([key, value]) => ({
            key,
            value,
          }),
        ),

        isExisting: true,
      })),
    );
  }, [data]);

  // ============================================================
  // SUBMIT
  // ============================================================

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();

    // ==========================================================
    // IMAGE METADATA
    // ==========================================================

    const imageMetadata: Array<{
      id?: string;

      fileKey?: string;

      altText?: string;

      isPrimary: boolean;
    }> = [];

    images.forEach((image, index) => {
      // ------------------------------------------------------
      // EXISTING IMAGE
      // ------------------------------------------------------

      if (image.isExisting) {
        imageMetadata.push({
          id: image.id,

          altText: image.altText,

          isPrimary: image.isPrimary,
        });

        return;
      }

      // ------------------------------------------------------
      // NEW IMAGE
      // ------------------------------------------------------

      if (image.file) {
        const fileKey = `image-${index}`;

        formData.append(fileKey, image.file);

        imageMetadata.push({
          fileKey,

          altText: image.altText,

          isPrimary: image.isPrimary,
        });
      }
    });

    // ==========================================================
    // VARIANT METADATA
    // ==========================================================

    const variantMetadata: Array<{
      id?: string;

      name: string;

      sku: string;

      price?: string;

      compareAtPrice?: string;

      stock: string;

      imageFileKey?: string;

      attributes: Record<string, string>;
    }> = [];

    variants.forEach((variant, index) => {
      let imageFileKey: string | undefined;

      // ------------------------------------------------------
      // NEW VARIANT IMAGE
      // ------------------------------------------------------

      if (variant.imageFile) {
        imageFileKey = `variant-image-${index}`;

        formData.append(imageFileKey, variant.imageFile);
      }

      // ------------------------------------------------------
      // ATTRIBUTES
      // ------------------------------------------------------

      const attributes: Record<string, string> = {};

      variant.attributes.forEach((attribute: ProductVariantAttributeForm) => {
        const key = attribute.key.trim();

        const value = attribute.value.trim();

        if (key && value) {
          attributes[key] = value;
        }
      });

      // ------------------------------------------------------
      // BUILD VARIANT
      // ------------------------------------------------------

      variantMetadata.push({
        ...(variant.isExisting
          ? {
              id: variant.id,
            }
          : {}),

        name: variant.name,

        sku: variant.sku,

        ...(variant.price
          ? {
              price: variant.price,
            }
          : {}),

        ...(variant.compareAtPrice
          ? {
              compareAtPrice: variant.compareAtPrice,
            }
          : {}),

        stock: variant.stock,

        ...(imageFileKey
          ? {
              imageFileKey,
            }
          : {}),

        attributes,
      });
    });

    // ==========================================================
    // PRODUCT DATA
    // ==========================================================

    const productData = {
      name,

      slug: productSlug,

      sku,

      categoryId,

      brandId: brandId || null,

      description,

      shortDescription: shortDescription || null,

      price,

      compareAtPrice: compareAtPrice || null,

      costPrice: costPrice || null,

      currency: "NGN",

      stock,

      lowStockThreshold,

      warrantyMonths,

      weightKg: weightKg || null,

      isFeatured,

      isNewArrival,

      isBestSeller,

      isActive,

      metaTitle: metaTitle || null,

      metaDescription: metaDescription || null,

      images: imageMetadata,

      specifications,

      variants: variantMetadata,
    };

    // ==========================================================
    // APPEND JSON
    // ==========================================================

    formData.append("productData", JSON.stringify(productData));

    // ==========================================================
    // UPDATE
    // ==========================================================

    updateProductMutation.mutate(
      {
        slug,

        formData,
      },
      {
        onSuccess: () => {
          window.alert("Product updated successfully.");

          router.push("/admin/products");
        },
      },
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Loading product...</p>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <h2 className="text-sm font-semibold text-red-700">
          Failed to load product
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>

        <Link
          href="/admin/products"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </div>
    );
  }

  // ============================================================
  // NOT FOUND
  // ============================================================

  if (!data?.data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Product not found.</p>

        <Link
          href="/admin/products"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <form onSubmit={handleSubmit}>
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update the information for{" "}
            <span className="font-medium text-slate-700">{name}</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={updateProductMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />

          {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* ======================================================
          UPDATE ERROR
      ======================================================= */}

      {updateProductMutation.isError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {updateProductMutation.error instanceof Error
              ? updateProductMutation.error.message
              : "Failed to update product."}
          </p>
        </div>
      )}

      {/* ======================================================
          FORM
      ======================================================= */}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <ProductBasicInfo
            name={name}
            slug={productSlug}
            sku={sku}
            categoryId={categoryId}
            brandId={brandId}
            description={description}
            shortDescription={shortDescription}
            onNameChange={setName}
            onSlugChange={setProductSlug}
            onSkuChange={setSku}
            onCategoryChange={setCategoryId}
            onBrandChange={setBrandId}
            onDescriptionChange={setDescription}
            onShortDescriptionChange={setShortDescription}
          />

          <ProductPricing
            price={price}
            compareAtPrice={compareAtPrice}
            costPrice={costPrice}
            onPriceChange={setPrice}
            onCompareAtPriceChange={setCompareAtPrice}
            onCostPriceChange={setCostPrice}
          />

          <ProductInventory
            stock={stock}
            lowStockThreshold={lowStockThreshold}
            warrantyMonths={warrantyMonths}
            weightKg={weightKg}
            onStockChange={setStock}
            onLowStockThresholdChange={setLowStockThreshold}
            onWarrantyMonthsChange={setWarrantyMonths}
            onWeightKgChange={setWeightKg}
          />

          <ProductImages images={images} onImagesChange={setImages} />

          <ProductSpecifications
            specifications={specifications}
            onSpecificationsChange={setSpecifications}
          />

          <ProductVariants variants={variants} onVariantsChange={setVariants} />

          <ProductSeo
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={setMetaDescription}
          />
        </div>

        <div>
          <ProductStatus
            isFeatured={isFeatured}
            isNewArrival={isNewArrival}
            isBestSeller={isBestSeller}
            isActive={isActive}
            onFeaturedChange={setIsFeatured}
            onNewArrivalChange={setIsNewArrival}
            onBestSellerChange={setIsBestSeller}
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
          disabled={updateProductMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />

          {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
