import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { brands } from "@/db/schema";

import { eq } from "drizzle-orm";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

import { requireAdmin } from "@/lib/APIs/auth";

import { updateBrandSchema } from "@/lib/zod-validations/brands";

// ============================================================
// PATCH /api/admin/brands/[slug]
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

    // Find existing brand.
    const existingBrand = await db.query.brands.findFirst({
      where: {
        slug,
      },
    });

    if (!existingBrand) {
      throw new ApiError("Brand not found", 404);
    }

    // Validate update data.
    const input = updateBrandSchema.parse(await req.json());

    // Prevent empty PATCH request.
    if (Object.keys(input).length === 0) {
      throw new ApiError("No fields provided to update", 400);
    }

    // Update brand.
    const [updatedBrand] = await db
      .update(brands)
      .set({
        ...input,

        updatedAt: new Date(),
      })
      .where(eq(brands.id, existingBrand.id))
      .returning();

    if (!updatedBrand) {
      throw new ApiError("Brand update failed", 500);
    }

    return Response.json({
      success: true,
      data: updatedBrand,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// DELETE /api/admin/brands/[slug]
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

    // Find existing brand.
    const existingBrand = await db.query.brands.findFirst({
      where: {
        slug,
      },
    });

    if (!existingBrand) {
      throw new ApiError("Brand not found", 404);
    }

    // Soft delete / deactivate brand.
    const [updatedBrand] = await db
      .update(brands)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, existingBrand.id))
      .returning();

    if (!updatedBrand) {
      throw new ApiError("Brand deactivation failed", 500);
    }

    return Response.json({
      success: true,
      data: {
        message: "Brand deactivated successfully",
      },
    }); 
  } catch (error) {
    return handleApiError(error);
  }
}