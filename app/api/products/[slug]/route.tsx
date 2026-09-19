import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/products/[slug]
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const product = await db.query.products.findFirst({
      where: { slug },
      with: {
        category: true,
        brand: true,
        images: {
          orderBy: { position: "asc" },
        },
        specifications: {
          orderBy: { position: "asc" },
        },
        variants: {
          where: { isActive: true },
        },
      },
    });

    if (!product || !product.isActive) {
      throw new ApiError("Product not found", 404);
    }

    return Response.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return handleApiError(error);
  }
}