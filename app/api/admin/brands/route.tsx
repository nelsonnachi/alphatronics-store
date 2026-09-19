import { NextRequest } from "next/server";

import { db } from "@/db/drizzle";
import { brands } from "@/db/schema";

import {
  ApiError,
  handleApiError,
} from "@/lib/APIs/api-errors";

import { requireAdmin } from "@/lib/APIs/auth";

import { createBrandSchema } from "@/lib/zod-validations/brands";

// ============================================================
// GET /api/admin/brands
// ============================================================

export async function GET(
  _req: NextRequest,
) {
  try {
    await requireAdmin();

    const rows =
      await db.query.brands.findMany({
        orderBy: {
          name: "asc",
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
// POST /api/admin/brands
// ============================================================

export async function POST(
  req: NextRequest,
) {
  try {
    await requireAdmin();

    const input =
      createBrandSchema.parse(
        await req.json(),
      );

    const [createdBrand] =
      await db
        .insert(brands)
        .values({
          name: input.name,

          slug: input.slug,

          logoUrl:
            input.logoUrl,

          description:
            input.description,

          website:
            input.website,
        })
        .returning();

    if (!createdBrand) {
      throw new ApiError(
        "Brand creation failed",
        500,
      );
    }

    return Response.json(
      {
        success: true,
        data: createdBrand,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}