import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";

import {
  ApiError,
  handleApiError,
} from "@/lib/APIs/api-errors";

import { requireAdmin } from "@/lib/APIs/auth";

import { createCategorySchema } from "@/lib/zod-validations/categories";

// ============================================================
// GET /api/admin/categories
// ============================================================

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();

    const rows = await db.query.categories.findMany({
        orderBy: {
          displayOrder: "asc",
        },
      });

    return Response.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// POST /api/admin/categories
// ============================================================

export async function POST(
  req: NextRequest,
) {
  try {
    await requireAdmin();

    const input = createCategorySchema.parse(
        await req.json(),
      );

    const [createdCategory] = await db.insert(categories)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          imageUrl: input.imageUrl,
          icon: input.icon,
          parentId: input.parentId ?? null,
          displayOrder: input.displayOrder,
          isFeatured: input.isFeatured,
          metaTitle: input.metaTitle,
          metaDescription:
            input.metaDescription,
        })
        .returning();

    if (!createdCategory) {
      throw new ApiError(
        "Category creation failed",
        500,
      );
    }

    return Response.json(
      {
        success: true,
        data: createdCategory,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}