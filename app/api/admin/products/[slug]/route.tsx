import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import {
  products,
  productImages,
  productSpecifications,
  productVariants,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { ApiError, handleApiError } from "@/lib/APIs/api-errors";
import { requireAdmin } from "@/lib/APIs/auth";
import { updateProductSchema } from "@/lib/zod-validations/products";
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload";
import { deleteImageFromCloudinary } from "@/lib/cloudinary/delete";

export const runtime = "nodejs";

// ============================================================
// GET SINGLE ADMIN PRODUCT
// GET /api/admin/products/[slug]
// ============================================================

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();

    const { slug } = await params;

    const product = await db.query.products.findFirst({
      where: {
        slug,
      },
      with: {
        category: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },

        brand: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },

        images: {
          orderBy: {
            position: "asc",
          },
        },

        specifications: {
          orderBy: {
            position: "asc",
          },
        },

        variants: true,
      },
    });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return Response.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("GET /api/admin/products/[slug] error:", error);

    return handleApiError(error);
  }
}

// ============================================================
// PATCH /api/admin/products/[slug]
// ============================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const newlyUploadedPublicIds: string[] = [];
  const oldPublicIdsToDelete: string[] = [];

  try {
    await requireAdmin();

    const { slug } = await params;

    // ----------------------------------------------------------
    // FIND EXISTING PRODUCT
    // ----------------------------------------------------------

    const existing = await db.query.products.findFirst({
      where: {
        slug,
      },
      with: {
        images: true,
        variants: true,
        specifications: true,
      },
    });

    if (!existing) {
      throw new ApiError("Product not found", 404);
    }

    // ----------------------------------------------------------
    // READ FORM DATA
    // ----------------------------------------------------------

    const formData = await req.formData();

    const productData = formData.get("productData");

    if (typeof productData !== "string") {
      throw new ApiError("Product data is required", 400);
    }

    let parsedProductData: unknown;

    try {
      parsedProductData = JSON.parse(productData);
    } catch {
      throw new ApiError("Invalid product data JSON", 400);
    }

    const input = updateProductSchema.parse(parsedProductData);

    // ----------------------------------------------------------
    // UPLOAD NEW PRODUCT IMAGES
    // ----------------------------------------------------------

    const uploadedProductImages = new Map<
      string,
      {
        url: string;
        publicId: string;
      }
    >();

    if (input.images) {
      for (const image of input.images) {
        if (!image.fileKey) {
          continue;
        }

        const file = formData.get(image.fileKey);

        if (!(file instanceof File)) {
          throw new ApiError(
            `Image file "${image.fileKey}" was not provided`,
            400,
          );
        }

        if (!file.type.startsWith("image/")) {
          throw new ApiError(
            `"${file.name}" is not a valid image`,
            400,
          );
        }

        const uploaded = await uploadImageToCloudinary(
          file,
          "alphatronics/products",
        );

        newlyUploadedPublicIds.push(uploaded.publicId);

        uploadedProductImages.set(image.fileKey, {
          url: uploaded.url,
          publicId: uploaded.publicId,
        });
      }
    }

    // ----------------------------------------------------------
    // UPLOAD NEW VARIANT IMAGES
    // ----------------------------------------------------------

    const uploadedVariantImages = new Map<
      string,
      {
        url: string;
        publicId: string;
      }
    >();

    if (input.variants) {
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

        if (!file.type.startsWith("image/")) {
          throw new ApiError(
            `"${file.name}" is not a valid image`,
            400,
          );
        }

        const uploaded = await uploadImageToCloudinary(
          file,
          "alphatronics/product-variants",
        );

        newlyUploadedPublicIds.push(uploaded.publicId);

        uploadedVariantImages.set(variant.imageFileKey, {
          url: uploaded.url,
          publicId: uploaded.publicId,
        });
      }
    }

    // ----------------------------------------------------------
    // STOCK STATUS
    // ----------------------------------------------------------

    const newStock = input.stock ?? existing.stock;

    const newLowStockThreshold =
      input.lowStockThreshold ?? existing.lowStockThreshold;

    const shouldUpdateStockStatus =
      input.stock !== undefined ||
      input.lowStockThreshold !== undefined;

    // ----------------------------------------------------------
    // DATABASE TRANSACTION
    // ----------------------------------------------------------

    const updated = await db.transaction(async (tx) => {
      // --------------------------------------------------------
      // UPDATE PRODUCT
      // --------------------------------------------------------

      const [updatedProduct] = await tx
        .update(products)
        .set({
          ...(input.name !== undefined
            ? { name: input.name }
            : {}),

          ...(input.slug !== undefined
            ? { slug: input.slug }
            : {}),

          ...(input.sku !== undefined
            ? { sku: input.sku }
            : {}),

          ...(input.categoryId !== undefined
            ? { categoryId: input.categoryId }
            : {}),

          ...(input.brandId !== undefined
            ? { brandId: input.brandId }
            : {}),

          ...(input.description !== undefined
            ? { description: input.description }
            : {}),

          ...(input.shortDescription !== undefined
            ? { shortDescription: input.shortDescription }
            : {}),

          ...(input.price !== undefined
            ? { price: String(input.price) }
            : {}),

          ...(input.compareAtPrice !== undefined
            ? {
                compareAtPrice:
                  input.compareAtPrice === null
                    ? null
                    : String(input.compareAtPrice),
              }
            : {}),

          ...(input.costPrice !== undefined
            ? {
                costPrice:
                  input.costPrice === null
                    ? null
                    : String(input.costPrice),
              }
            : {}),

          ...(input.currency !== undefined
            ? { currency: input.currency }
            : {}),

          ...(input.stock !== undefined
            ? { stock: input.stock }
            : {}),

          ...(input.lowStockThreshold !== undefined
            ? {
                lowStockThreshold: input.lowStockThreshold,
              }
            : {}),

          ...(shouldUpdateStockStatus
            ? {
                stockStatus:
                  newStock === 0
                    ? "out_of_stock"
                    : newStock <= newLowStockThreshold
                      ? "low_stock"
                      : "in_stock",
              }
            : {}),

          ...(input.warrantyMonths !== undefined
            ? {
                warrantyMonths: input.warrantyMonths,
              }
            : {}),

          ...(input.weightKg !== undefined
            ? {
                weightKg:
                  input.weightKg === null
                    ? null
                    : String(input.weightKg),
              }
            : {}),

          ...(input.isFeatured !== undefined
            ? {
                isFeatured: input.isFeatured,
              }
            : {}),

          ...(input.isNewArrival !== undefined
            ? {
                isNewArrival: input.isNewArrival,
              }
            : {}),

          ...(input.isBestSeller !== undefined
            ? {
                isBestSeller: input.isBestSeller,
              }
            : {}),

          ...(input.isActive !== undefined
            ? {
                isActive: input.isActive,
              }
            : {}),

          ...(input.metaTitle !== undefined
            ? {
                metaTitle: input.metaTitle,
              }
            : {}),

          ...(input.metaDescription !== undefined
            ? {
                metaDescription: input.metaDescription,
              }
            : {}),

          updatedAt: new Date(),
        })
        .where(eq(products.id, existing.id))
        .returning();

      if (!updatedProduct) {
        throw new ApiError(
          "Product update failed",
          500,
        );
      }

      // --------------------------------------------------------
      // PRODUCT IMAGES
      // --------------------------------------------------------

      if (input.images) {
        const existingImageIds = input.images
          .filter((image) => image.id)
          .map((image) => image.id!);

        const imagesToDelete = existing.images.filter(
          (oldImage) =>
            !existingImageIds.includes(oldImage.id),
        );

        // Save old Cloudinary IDs for deletion
        for (const image of imagesToDelete) {
          if (image.publicId) {
            oldPublicIdsToDelete.push(
              image.publicId,
            );
          }
        }

        // Delete removed images from database
        if (imagesToDelete.length > 0) {
          await tx
            .delete(productImages)
            .where(
              inArray(
                productImages.id,
                imagesToDelete.map(
                  (image) => image.id,
                ),
              ),
            );
        }

        // Update existing images / insert new images
        for (
          let index = 0;
          index < input.images.length;
          index++
        ) {
          const image = input.images[index];

          if (!image) {
            continue;
          }

          // EXISTING IMAGE
          if (image.id) {
            const existingImage =
              existing.images.find(
                (oldImage) =>
                  oldImage.id === image.id,
              );

            if (!existingImage) {
              throw new ApiError(
                `Product image "${image.id}" does not belong to this product`,
                400,
              );
            }

            await tx
              .update(productImages)
              .set({
                altText:
                  image.altText ??
                  existingImage.altText,

                position: index,

                isPrimary:
                  image.isPrimary ??
                  existingImage.isPrimary,
              })
              .where(
                eq(
                  productImages.id,
                  image.id,
                ),
              );
          }

          // NEW IMAGE
          else if (image.fileKey) {
            const uploaded =
              uploadedProductImages.get(
                image.fileKey,
              );

            if (!uploaded) {
              throw new ApiError(
                `Uploaded image "${image.fileKey}" was not found`,
                400,
              );
            }

            await tx
              .insert(productImages)
              .values({
                productId: existing.id,
                url: uploaded.url,
                publicId: uploaded.publicId,
                altText:
                  image.altText ??
                  updatedProduct.name,
                position: index,
                isPrimary:
                  image.isPrimary ?? false,
              });
          }
        }
      }

      // --------------------------------------------------------
      // PRODUCT VARIANTS
      // --------------------------------------------------------

      if (input.variants) {
        const existingVariantIds =
          input.variants
            .filter((variant) => variant.id)
            .map((variant) => variant.id!);

        const variantsToDelete =
          existing.variants.filter(
            (oldVariant) =>
              !existingVariantIds.includes(
                oldVariant.id,
              ),
          );

        // Save old variant image IDs
        for (const variant of variantsToDelete) {
          if (variant.imagePublicId) {
            oldPublicIdsToDelete.push(
              variant.imagePublicId,
            );
          }
        }

        // Delete removed variants
        if (variantsToDelete.length > 0) {
          await tx
            .delete(productVariants)
            .where(
              inArray(
                productVariants.id,
                variantsToDelete.map(
                  (variant) => variant.id,
                ),
              ),
            );
        }

        // Update existing variants / create new variants
        for (const variant of input.variants) {
          // ----------------------------------------------------
          // EXISTING VARIANT
          // ----------------------------------------------------

          if (variant.id) {
            const existingVariant =
              existing.variants.find(
                (oldVariant) =>
                  oldVariant.id === variant.id,
              );

            if (!existingVariant) {
              throw new ApiError(
                `Variant "${variant.id}" does not belong to this product`,
                400,
              );
            }

            let imageUrl =
              existingVariant.imageUrl;

            let imagePublicId =
              existingVariant.imagePublicId;

            // Remove old image
            if (
              variant.removeImage &&
              existingVariant.imagePublicId
            ) {
              oldPublicIdsToDelete.push(
                existingVariant.imagePublicId,
              );

              imageUrl = null;
              imagePublicId = null;
            }

            // Replace with new image
            if (variant.imageFileKey) {
              const uploaded =
                uploadedVariantImages.get(
                  variant.imageFileKey,
                );

              if (!uploaded) {
                throw new ApiError(
                  `Uploaded variant image "${variant.imageFileKey}" was not found`,
                  400,
                );
              }

              if (
                existingVariant.imagePublicId
              ) {
                oldPublicIdsToDelete.push(
                  existingVariant.imagePublicId,
                );
              }

              imageUrl = uploaded.url;
              imagePublicId =
                uploaded.publicId;
            }

            await tx
              .update(productVariants)
              .set({
                name:
                  variant.name ??
                  existingVariant.name,

                sku:
                  variant.sku ??
                  existingVariant.sku,

                price:
                  variant.price !== undefined
                    ? String(variant.price)
                    : existingVariant.price,

                compareAtPrice:
                  variant.compareAtPrice !==
                  undefined
                    ? variant.compareAtPrice ===
                      null
                      ? null
                      : String(
                          variant.compareAtPrice,
                        )
                    : existingVariant.compareAtPrice,

                stock:
                  variant.stock ??
                  existingVariant.stock,

                attributes:
                  variant.attributes ??
                  existingVariant.attributes,

                imageUrl,
                imagePublicId,
              })
              .where(
                eq(
                  productVariants.id,
                  variant.id,
                ),
              );
          }

          // ----------------------------------------------------
          // NEW VARIANT
          // ----------------------------------------------------

          else {
            if (!variant.name || !variant.sku) {
              throw new ApiError(
                "New variants require both a name and sku",
                400,
              );
            }

            let imageUrl:
              | string
              | undefined;

            let imagePublicId:
              | string
              | undefined;

            if (variant.imageFileKey) {
              const uploaded =
                uploadedVariantImages.get(
                  variant.imageFileKey,
                );

              if (!uploaded) {
                throw new ApiError(
                  `Uploaded variant image "${variant.imageFileKey}" was not found`,
                  400,
                );
              }

              imageUrl = uploaded.url;
              imagePublicId =
                uploaded.publicId;
            }

            await tx
              .insert(productVariants)
              .values({
                productId: existing.id,

                name: variant.name,

                sku: variant.sku,

                price:
                  variant.price !== undefined
                    ? String(variant.price)
                    : undefined,

                compareAtPrice:
                  variant.compareAtPrice !==
                  undefined
                    ? variant.compareAtPrice ===
                      null
                      ? null
                      : String(
                          variant.compareAtPrice,
                        )
                    : undefined,

                stock:
                  variant.stock ?? 0,

                attributes:
                  variant.attributes ?? {},

                imageUrl,

                imagePublicId,

                isActive: true,
              });
          }
        }
      }

      // --------------------------------------------------------
      // PRODUCT SPECIFICATIONS
      // --------------------------------------------------------

      if (input.specifications) {
        await tx
          .delete(productSpecifications)
          .where(
            eq(
              productSpecifications.productId,
              existing.id,
            ),
          );

        if (input.specifications.length > 0) {
          await tx
            .insert(productSpecifications)
            .values(
              input.specifications.map(
                (specification, index) => ({
                  productId: existing.id,
                  group: specification.group,
                  key: specification.key,
                  value: specification.value,
                  position: index,
                }),
              ),
            );
        }
      }

      return updatedProduct;
    });

    // ----------------------------------------------------------
    // DELETE OLD CLOUDINARY IMAGES
    // ----------------------------------------------------------

    await Promise.allSettled(
      oldPublicIdsToDelete.map(
        (publicId) =>
          deleteImageFromCloudinary(publicId),
      ),
    );

    // ----------------------------------------------------------
    // SUCCESS
    // ----------------------------------------------------------

    return Response.json({
      success: true,
      data: updated,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/products/[slug] error:",
      error,
    );

    // Delete newly uploaded images if something failed
    await Promise.allSettled(
      newlyUploadedPublicIds.map(
        (publicId) =>
          deleteImageFromCloudinary(publicId),
      ),
    );

    return handleApiError(error);
  }
}

// ============================================================
// DELETE /api/admin/products/[slug]
// ============================================================

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();

    const { slug } = await params;

    const existing = await db.query.products.findFirst({
      where: {
        slug,
      },
    });

    if (!existing) {
      throw new ApiError(
        "Product not found",
        404,
      );
    }

    // ----------------------------------------------------------
    // SOFT DELETE
    // ----------------------------------------------------------

    const [deleted] = await db
      .update(products)
      .set({
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(products.id, existing.id))
      .returning();

    if (!deleted) {
      throw new ApiError(
        "Product deletion failed",
        500,
      );
    }

    return Response.json({
      success: true,
      data: {
        message: "Product deleted successfully",
      },
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/products/[slug] error:",
      error,
    );

    return handleApiError(error);
  }
}