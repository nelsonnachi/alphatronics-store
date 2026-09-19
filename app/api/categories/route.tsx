import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";

import { handleApiError } from "@/lib/APIs/api-errors";

// ============================================================
// GET /api/categories
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const featuredOnly = searchParams.get("featured") === "true";

    const asTree = searchParams.get("tree") === "true";

    // ========================================================
    // CATEGORY TREE
    // ========================================================

    if (asTree) {
      const categoriesTree = await db.query.categories.findMany({
        where: {
          parentId: {
            isNull: true,
          },
          isActive: true,
        },

        orderBy: {
          displayOrder: "asc",
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

      return Response.json({
        success: true,
        data: categoriesTree,
      });
    }

    // ========================================================
    // NORMAL CATEGORY LIST
    // ========================================================

    const categoriesList = await db.query.categories.findMany({
      where: featuredOnly
        ? {
            isActive: true,
            isFeatured: true,
          }
        : {
            isActive: true,
          },

      orderBy: {
        displayOrder: "asc",
      },
    });

    return Response.json({
      success: true,
      data: categoriesList,
    });
  } catch (error) {
    return handleApiError(error);
  }
}