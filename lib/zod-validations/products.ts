import { z } from "zod";

/**
 * Boolean query parameter helper.
 */
function booleanQueryParam() {
  return z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true"));
}

/** Product specification*/
export const productSpecificationInput = z.object({
  group: z.string().trim().min(1).max(100).default("General"),

  key: z.string().trim().min(1).max(100),

  value: z.string().trim().min(1).max(500),
});

/**Product variant.* imageFileKey refers to the name of the File inside the multipart FormData.
 * Example: imageFileKey: "variant-image-0"*/
export const productVariantInput = z.object({
  name: z.string().trim().min(1).max(200),

  sku: z.string().trim().min(1).max(100),

  price: z.coerce.number().positive().optional(),

  compareAtPrice: z.coerce.number().positive().optional(),

  stock: z.coerce.number().int().min(0).default(0),

  imageFileKey: z.string().trim().optional(),

  attributes: z.record(z.string(), z.string()).default({}),
});
/** Product image metadata. fileKey tells the backend which File in FormData belongs to this image.*/
export const productImageInput = z.object({
  fileKey: z.string().min(1),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const updateProductImageInput = z
  .object({
    id: z.string().uuid().optional(),
    fileKey: z.string().min(1).optional(),
    altText: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })
  .refine((image) => image.id !== undefined || image.fileKey !== undefined, {
    message: "Image must have either an id or fileKey",
  });

export const updateProductVariantInput = z.object({
  id: z.string().uuid().optional(),

  name: z.string().trim().min(1).max(200).optional(),

  sku: z.string().trim().min(1).max(100).optional(),

  price: z.coerce.number().positive().nullable().optional(),

  compareAtPrice: z.coerce.number().positive().nullable().optional(),

  stock: z.coerce.number().int().min(0).optional(),

  imageFileKey: z.string().trim().optional(),

  removeImage: z.boolean().optional(),

  attributes: z.record(z.string(), z.string()).optional(),
});

/** CREATE PRODUCT*/
export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(200),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and hyphen-separated"
    ),

  sku: z.string().trim().min(2).max(100),

  categoryId: z.string().uuid(),

  brandId: z.string().uuid().optional(),

  description: z.string().trim().min(10),

  shortDescription: z.string().trim().max(300).optional(),

  price: z.coerce
    .number()
    .positive()
    .refine(
      (value) => Number.isInteger(value * 100),
      "Price can have at most 2 decimal places"
    ),

  compareAtPrice: z.coerce
    .number()
    .positive()
    .refine(
      (value) => Number.isInteger(value * 100),
      "Compare-at price can have at most 2 decimal places"
    )
    .optional(),

  costPrice: z.coerce
    .number()
    .positive()
    .refine(
      (value) => Number.isInteger(value * 100),
      "Cost price can have at most 2 decimal places"
    )
    .optional(),

  currency: z.literal("NGN").default("NGN"),

  stock: z.coerce.number().int().min(0).default(0),

  lowStockThreshold: z.coerce.number().int().min(0).default(5),

  warrantyMonths: z.coerce.number().int().min(0).default(12),

  weightKg: z.coerce.number().positive().optional(),

  isFeatured: z.boolean().default(false),

  isNewArrival: z.boolean().default(false),

  isBestSeller: z.boolean().default(false),

  isActive: z.boolean().default(true),

  metaTitle: z.string().trim().max(160).optional(),

  metaDescription: z.string().trim().max(300).optional(),

  images: z
    .array(productImageInput)
    .min(1, "At least one product image is required"),

  specifications: z.array(productSpecificationInput).default([]),

  variants: z.array(productVariantInput).default([]),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and hyphen-separated"
    )
    .optional(),

  sku: z.string().trim().min(2).max(100).optional(),

  categoryId: z.string().uuid().optional(),

  brandId: z.string().uuid().nullable().optional(),

  description: z.string().trim().min(10).optional(),

  shortDescription: z.string().trim().max(300).nullable().optional(),

  price: z.coerce
    .number()
    .positive()
    .refine(
      (value) => Number.isInteger(value * 100),
      "Price can have at most 2 decimal places"
    )
    .optional(),

  compareAtPrice: z.coerce
    .number()
    .positive()
    .refine(
      (value) => Number.isInteger(value * 100),
      "Compare-at price can have at most 2 decimal places"
    )
    .nullable()
    .optional(),

  costPrice: z.coerce
    .number()
    .positive()
    .refine(
      (value) => Number.isInteger(value * 100),
      "Cost price can have at most 2 decimal places"
    )
    .nullable()
    .optional(),

  currency: z.literal("NGN").optional(),

  stock: z.coerce.number().int().min(0).optional(),

  lowStockThreshold: z.coerce.number().int().min(0).optional(),

  warrantyMonths: z.coerce.number().int().min(0).optional(),

  weightKg: z.coerce.number().positive().nullable().optional(),

  isFeatured: z.boolean().optional(),

  isNewArrival: z.boolean().optional(),

  isBestSeller: z.boolean().optional(),

  isActive: z.boolean().optional(),

  metaTitle: z.string().trim().max(160).nullable().optional(),

  metaDescription: z.string().trim().max(300).nullable().optional(),

  images: z.array(updateProductImageInput).optional(),

  specifications: z.array(productSpecificationInput).optional(),

  variants: z.array(updateProductVariantInput).optional(),
});

/** GET /api/products query parameters (public/storefront) */
export const productQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    search: z.string().trim().optional(),

    category: z.string().trim().optional(),

    brand: z.string().trim().optional(),

    minPrice: z.coerce.number().min(0).optional(),

    maxPrice: z.coerce.number().min(0).optional(),

    featured: booleanQueryParam(),

    newArrival: booleanQueryParam(),

    bestSeller: booleanQueryParam(),

    inStock: booleanQueryParam(),

    minRating: z.coerce.number().min(0).max(5).optional(),

    sort: z
      .enum([
        "newest",
        "price_asc",
        "price_desc",
        "rating",
        "popularity",
        "name_asc",
      ])
      .default("newest"),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot be greater than maximum price",
      path: ["minPrice"],
    }
  );

/** GET /api/admin/products query parameters (admin/dashboard) */
export const adminProductQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    search: z.string().trim().optional(),

    category: z.string().trim().optional(),

    brand: z.string().trim().optional(),

    // Public route hardcodes isActive: true — admin needs to choose
    status: z.enum(["all", "active", "inactive"]).default("all"),

    minPrice: z.coerce.number().min(0).optional(),

    maxPrice: z.coerce.number().min(0).optional(),

    featured: booleanQueryParam(),

    newArrival: booleanQueryParam(),

    bestSeller: booleanQueryParam(),

    inStock: booleanQueryParam(),

    lowStock: booleanQueryParam(), // stock <= lowStockThreshold, admin-only concern

    sort: z
      .enum([
        "newest",
        "oldest",
        "price_asc",
        "price_desc",
        "name_asc",
        "stock_asc",
        "stock_desc",
      ])
      .default("newest"),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot be greater than maximum price",
      path: ["minPrice"],
    }
  );

export type CreateProductValidation = z.infer<typeof createProductSchema>;
export type UpdateProductValidation = z.infer<typeof updateProductSchema>;
export type ProductQueryValidation = z.infer<typeof productQuerySchema>;
export type AdminProductQueryValidation = z.infer<
  typeof adminProductQuerySchema
>;
