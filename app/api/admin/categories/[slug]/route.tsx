import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";

import { eq } from "drizzle-orm";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { requireAdmin } from "@/lib/APIs/auth";

import { updateCategorySchema } from "@/lib/zod-validations/categories";

// ============================================================
// PATCH /api/admin/categories/[slug]
//
// Admin-only endpoint.
// ============================================================

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
) {
  try {
    await requireAdmin();

    const { slug } = await params;

    // Find existing category.
    const existingCategory = await db.query.categories.findFirst({
      where: {
        slug,
      },
    });

    if (!existingCategory) {
      throw new ApiError("Category not found", 404);
    }

    // Validate update data.
    const input = updateCategorySchema.parse(await req.json());

    // Prevent empty PATCH requests.
    if (Object.keys(input).length === 0) {
      throw new ApiError("No fields provided to update", 400);
    }

    // Prevent a category from becoming its own parent.
    if (input.parentId && input.parentId === existingCategory.id) {
      throw new ApiError("A category cannot be its own parent", 400);
    }

    // Update category.
    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...input,

        updatedAt: new Date(),
      })
      .where(eq(categories.id, existingCategory.id))
      .returning();

    if (!updatedCategory) {
      throw new ApiError("Category update failed", 500);
    }

    return Response.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// DELETE /api/admin/categories/[slug]
//
// Admin-only endpoint. Soft delete.
// ============================================================

export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
) {
  try {
    await requireAdmin();

    const { slug } = await params;

    // Find category.
    const existingCategory = await db.query.categories.findFirst({
      where: {
        slug,
      },
    });

    if (!existingCategory) {
      throw new ApiError("Category not found", 404);
    }

    // Soft delete / deactivate category.
    const [updatedCategory] = await db
      .update(categories)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, existingCategory.id))
      .returning();

    if (!updatedCategory) {
      throw new ApiError("Category deactivation failed", 500);
    }

    return Response.json({
      success: true,
      data: {
        message: "Category deactivated successfully",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}