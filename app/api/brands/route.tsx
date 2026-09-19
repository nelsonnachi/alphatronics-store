import { db } from "@/db/drizzle";

import { handleApiError } from "@/lib/APIs/api-errors";

// ============================================================
// GET /api/brands
// ============================================================

export async function GET() {
  try {
    const brandList = await db.query.brands.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        name: "asc",
      },
    });

    return Response.json({
      success: true,
      data: brandList,
    });
  } catch (error) {
    return handleApiError(error);
  }
}