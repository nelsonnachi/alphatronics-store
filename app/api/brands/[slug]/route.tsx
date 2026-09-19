import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";

import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

// ============================================================
// GET /api/brands/[slug]
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

    const brand = await db.query.brands.findFirst({
      where: {
        slug,
        isActive: true,
      },
    });

    if (!brand) {
      throw new ApiError("Brand not found", 404);
    }

    return Response.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    return handleApiError(error);
  }
}