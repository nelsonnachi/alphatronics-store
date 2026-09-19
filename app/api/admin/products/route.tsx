import { NextRequest } from "next/server";
import { and, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import {
  products,
  productImages,
  productSpecifications,
  productVariants,
} from "@/db/schema";
import { db } from "@/db/drizzle";
import { adminProductQuerySchema, createProductSchema } from "@/lib/zod-validations/products";
import { ApiError, handleApiError } from "@/lib/APIs/api-errors";
import { requireAdmin } from "@/lib/APIs/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload";
import { deleteImageFromCloudinary } from "@/lib/cloudinary/delete";

export const runtime = "nodejs";



// What Cloudinary gives us back after an upload.
interface UploadedImage {
  url: string;
  publicId: string;
}

// A product image also needs to remember its alt text and whether it's the "main" image for the product.
interface UploadedProductImage extends UploadedImage {
  altText?: string;
  isPrimary: boolean;
}

const VALID_IMAGE_EXTENSIONS = [".jpg",".jpeg",".png",".webp",".gif",".avif",];

/** Checks whether an uploaded file actually looks like an image. */
function isValidImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) {
    return true;
  }
  const fileName = file.name.toLowerCase();
  return VALID_IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
}

// GET /api/admin/products
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const query = adminProductQuerySchema.parse(searchParams);

    // Resolve category slug -> id
    let categoryId: string | undefined;
    if (query.category) {
      const category = await db.query.categories.findFirst({
        where: { slug: query.category },
        columns: { id: true },
      });
      categoryId = category?.id;
    }

    // Resolve brand slugs -> ids
    let brandIds: string[] | undefined;
    if (query.brand) {
      const brandSlugs = query.brand.split(",").map((s) => s.trim()).filter(Boolean);
      if (brandSlugs.length > 0) {
        const brandRows = await db.query.brands.findMany({
          where: { slug: { in: brandSlugs } },
          columns: { id: true },
        });
        if (brandRows.length > 0) brandIds = brandRows.map((b) => b.id);
      }
    }

    const offset = (query.page - 1) * query.limit;

    const sortMap = {
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      name_asc: { name: "asc" },
      stock_asc: { stock: "asc" },
      stock_desc: { stock: "desc" },
    } as const;
    const orderBy = sortMap[query.sort];

    const filters = {
      ...(query.status === "active" && { isActive: true }),
      ...(query.status === "inactive" && { isActive: false }),

      ...(query.search && {
        OR: [
          { name: { ilike: `%${query.search}%` } },
          { shortDescription: { ilike: `%${query.search}%` } },
          { sku: { ilike: `%${query.search}%` } },
        ],
      }),

      ...(categoryId && { categoryId }),
      ...(brandIds && brandIds.length > 0 && { brandId: { in: brandIds } }),

      ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
        price: {
          ...(query.minPrice !== undefined && { gte: String(query.minPrice) }),
          ...(query.maxPrice !== undefined && { lte: String(query.maxPrice) }),
        },
      }),

      ...(query.inStock && { stock: { gte: 1 } }),
      ...(query.featured && { isFeatured: true }),
      ...(query.newArrival && { isNewArrival: true }),
      ...(query.bestSeller && { isBestSeller: true }),
    };

    // Matching raw SQL conditions for the COUNT query
    const countConditions = [];

    if (query.status === "active") countConditions.push(eq(products.isActive, true));
    if (query.status === "inactive") countConditions.push(eq(products.isActive, false));

    if (query.search) {
      countConditions.push(
        or(
          ilike(products.name, `%${query.search}%`),
          ilike(products.shortDescription, `%${query.search}%`),
          ilike(products.sku, `%${query.search}%`),
        )!,
      );
    }
    if (categoryId) countConditions.push(eq(products.categoryId, categoryId));
    if (brandIds && brandIds.length > 0) countConditions.push(inArray(products.brandId, brandIds));
    if (query.minPrice !== undefined) countConditions.push(gte(products.price, String(query.minPrice)));
    if (query.maxPrice !== undefined) countConditions.push(lte(products.price, String(query.maxPrice)));
    if (query.inStock) countConditions.push(gte(products.stock, 1));
    if (query.featured) countConditions.push(eq(products.isFeatured, true));
    if (query.newArrival) countConditions.push(eq(products.isNewArrival, true));
    if (query.bestSeller) countConditions.push(eq(products.isBestSeller, true));

    const [rows, total] = await Promise.all([
      db.query.products.findMany({
        where: filters,
        orderBy,
        limit: query.limit,
        offset,
        with: {
          category: { columns: { id: true, name: true, slug: true } },
          brand: { columns: { id: true, name: true, slug: true } },
          images: { orderBy: { position: "asc" } },
          specifications: true,
          variants: true,
        },
      }),

      db.$count(products, countConditions.length > 0 ? and(...countConditions) : undefined),
    ]);

    return Response.json({
      success: true,
      data: rows,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
  const uploadedPublicIds: string[] = [];

  try {
    await requireAdmin();

    // Read and validate the incoming form data
    const formData = await req.formData();
    const productDataField = formData.get("productData");

    if (typeof productDataField !== "string") {
      throw new ApiError("Product data is required", 400);
    }

    let parsedProductData: unknown;
    try {
      parsedProductData = JSON.parse(productDataField);
    } catch {
      throw new ApiError("Invalid product data JSON", 400);
    }

    const input = createProductSchema.parse(parsedProductData);

    //  Upload product images
    const uploadedProductImages: UploadedProductImage[] = [];

    for (const image of input.images) {
      const file = formData.get(image.fileKey);

      if (!(file instanceof File)) {
        throw new ApiError(`Image file "${image.fileKey}" was not provided`, 400);
      }

      if (!isValidImageFile(file)) {
        throw new ApiError(`"${file.name}" is not a valid image`, 400);
      }

      const uploaded = await uploadImageToCloudinary(file, "alphatronics/products");
      uploadedPublicIds.push(uploaded.publicId);

      uploadedProductImages.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        altText: image.altText,
        isPrimary: image.isPrimary,
      });
    }

    // Upload variant images (only variants that have one)
    // Map lets us quickly look up "which uploaded image belongs to which variant" later, using the same fileKey.
    const uploadedVariantImages = new Map<string, UploadedImage>();

    for (const variant of input.variants) {
      if (!variant.imageFileKey) {
        continue;
      }

      const file = formData.get(variant.imageFileKey);

      if (!(file instanceof File)) {
        throw new ApiError(
          `Variant image "${variant.imageFileKey}" was not provided`,
          400,
        );
      }

      if (!isValidImageFile(file)) {
        throw new ApiError(`"${file.name}" is not a valid image`, 400);
      }

      const uploaded = await uploadImageToCloudinary(
        file,
        "alphatronics/product-variants",
      );
      uploadedPublicIds.push(uploaded.publicId);

      uploadedVariantImages.set(variant.imageFileKey, {
        url: uploaded.url,
        publicId: uploaded.publicId,
      });
    }

    // Save everything to the database in one transaction
    const createdProduct = await db.transaction(async (tx) => {
      const stockStatus =
        input.stock === 0
          ? "out_of_stock"
          : input.stock <= input.lowStockThreshold
            ? "low_stock"
            : "in_stock";

      const [product] = await tx
        .insert(products)
        .values({
          name: input.name,
          slug: input.slug,
          sku: input.sku,
          categoryId: input.categoryId,
          brandId: input.brandId,
          description: input.description,
          shortDescription: input.shortDescription,
          price: String(input.price),
          compareAtPrice: input.compareAtPrice !== undefined ? String(input.compareAtPrice) : undefined,
          costPrice:  input.costPrice !== undefined ? String(input.costPrice) : undefined,
          currency: input.currency,
          stock: input.stock,
          lowStockThreshold: input.lowStockThreshold,
          stockStatus: stockStatus,
          warrantyMonths: input.warrantyMonths,
          weightKg: input.weightKg !== undefined ? String(input.weightKg) : undefined,
          isFeatured: input.isFeatured,
          isNewArrival: input.isNewArrival,
          isBestSeller: input.isBestSeller,
          isActive: input.isActive,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
        })
        .returning();

      if (!product) {
        throw new ApiError("Product creation failed", 500);
      }

      if (uploadedProductImages.length > 0) {
        await tx.insert(productImages).values(
          uploadedProductImages.map((image, index) => ({
            productId: product.id,
            url: image.url,
            publicId: image.publicId,
            altText: image.altText ?? product.name,
            position: index,
            // The first image is always treated as primary, even if it wasn't explicitly marked as such.
            isPrimary: image.isPrimary || index === 0,
          })),
        );
      }

      if (input.specifications.length > 0) {
        await tx.insert(productSpecifications).values(
          input.specifications.map((specification, index) => ({
            productId: product.id,
            group: specification.group,
            key: specification.key,
            value: specification.value,
            position: index,
          })),
        );
      }

      if (input.variants.length > 0) {
        await tx.insert(productVariants).values(
          input.variants.map((variant) => {
            const variantImage = variant.imageFileKey
              ? uploadedVariantImages.get(variant.imageFileKey)
              : undefined;

            return {
              productId: product.id,
              name: variant.name,
              sku: variant.sku,
              price: variant.price !== undefined ? String(variant.price) : undefined,
              compareAtPrice: variant.compareAtPrice !== undefined ? String(variant.compareAtPrice)
                  : undefined,
              stock: variant.stock,
              imageUrl: variantImage?.url,
              imagePublicId: variantImage?.publicId,
              attributes: variant.attributes,
            };
          }),
        );
      }

      return product;
    });

    return Response.json(
      {
        success: true,
        data: createdProduct,
        message: "Product created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/products error:", error);

    await Promise.allSettled(
      uploadedPublicIds.map((publicId) => deleteImageFromCloudinary(publicId)),
    );

    return handleApiError(error);
  }
}