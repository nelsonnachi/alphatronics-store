import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

// ============================================================
// GET /api/categories/[slug]
// ============================================================

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
) {
  try {
    const { slug } = await params;

    const category = await db.query.categories.findFirst({
      where: {
        slug,
        isActive: true,
      },

      with: {
        children: {
          where: {
            isActive: true,
          },

          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    return Response.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return handleApiError(error);
  }
}