import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { ApiError, handleApiError } from "@/lib/APIs/api-errors";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/products/[slug]/related
 *
 * Returns products related to the current product.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // ---------------------------------------------------------
    // 1. Find the product currently being viewed
    // ---------------------------------------------------------

    const currentProduct = await db.query.products.findFirst({
      where: {
        slug,
      },
      columns: {
        id: true,
        categoryId: true,
        brandId: true,
        isActive: true,
      },
    });

    // ---------------------------------------------------------
    // 2. Make sure the product exists and is active
    // ---------------------------------------------------------

    if (!currentProduct || !currentProduct.isActive) {
      throw new ApiError("Product not found", 404);
    }

    // ---------------------------------------------------------
    // 3. Find products in the same category
    //
    // We exclude the current product using { ne: ... }.
    // ---------------------------------------------------------

    const relatedProducts = await db.query.products.findMany({
      where: {
        isActive: true,
        categoryId: currentProduct.categoryId,
        id: {
          ne: currentProduct.id,
        },
      },

      // -------------------------------------------------------
      // 4. Prioritize:
      //
      //    - Best sellers
      //    - Higher sales
      //    - Higher ratings
      // -------------------------------------------------------

      orderBy: {
        isBestSeller: "desc",
        soldCount: "desc",
        avgRating: "desc",
      },

      // -------------------------------------------------------
      // 5. We only need a small number for the product page
      // -------------------------------------------------------

      limit: 8,

      // -------------------------------------------------------
      // 6. Only return fields the related-product card needs
      // -------------------------------------------------------

      columns: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        compareAtPrice: true,
        currency: true,
        stock: true,
        stockStatus: true,
        avgRating: true,
        reviewCount: true,
        isBestSeller: true,
        isNewArrival: true,
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
          limit: 3,
        },
      },
    });

    // ---------------------------------------------------------
    // 7. Return the related products
    // ---------------------------------------------------------

    return Response.json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    return handleApiError(error);
  }
} 