import { NextRequest } from "next/server";
import { and, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import { products } from "@/db/schema";
import { db } from "@/db/drizzle";
import { productQuerySchema } from "@/lib/zod-validations/products";
import { handleApiError } from "@/lib/APIs/api-errors";

export const runtime = "nodejs";

interface ProductFilters {
  isActive: boolean;
  OR?: Array<
    | { name: { ilike: string } }
    | { shortDescription: { ilike: string } }
    | { sku: { ilike: string } }
  >;
  categoryId?: string;
  brandId?: { in: string[] };
  price?: { gte?: string; lte?: string };
  avgRating?: { gte: string };
  stock?: { gte: number };
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

/** GET /api/products*/
export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const query = productQuerySchema.parse(searchParams);

    //  Turn "category" slug into a categoryId
    let categoryId: string | undefined;

    if (query.category) {
      const category = await db.query.categories.findFirst({
        where: { slug: query.category },
        columns: { id: true },
      });

      categoryId = category?.id;
    }

    //  Turn "brand" slugs (comma-separated) into brandIds
    let brandIds: string[] | undefined;
    if (query.brand) {
      const brandSlugs = query.brand
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean);

      if (brandSlugs.length > 0) {
        const brandRows = await db.query.brands.findMany({
          where: { slug: { in: brandSlugs } },
          columns: { id: true },
        });

        if (brandRows.length > 0) {
          brandIds = brandRows.map((brand) => brand.id);
        }
      }
    }

    // Pagination
    const offset = (query.page - 1) * query.limit;

    // Sorting
    const sortMap = {
      newest: { createdAt: "desc" },
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      rating: { avgRating: "desc" },
      popularity: { soldCount: "desc" },
      name_asc: { name: "asc" },
    } as const;

    const orderBy = sortMap[query.sort] ?? sortMap.newest;

   
    const filters = {
      isActive: true,

      ...(query.search && {
        OR: [
          { name: { ilike: `%${query.search}%` } },
          { shortDescription: { ilike: `%${query.search}%` } },
          { sku: { ilike: `%${query.search}%` } },
        ],
      }),

      ...(categoryId && { categoryId }),

      ...(brandIds && brandIds.length > 0 && { brandId: { in: brandIds } }),

      ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
        price: {
          ...(query.minPrice !== undefined && { gte: String(query.minPrice) }),
          ...(query.maxPrice !== undefined && { lte: String(query.maxPrice) }),
        },
      }),

      ...(query.minRating !== undefined && {
        avgRating: { gte: String(query.minRating) },
      }),

      ...(query.inStock && { stock: { gte: 1 } }),

      ...(query.featured && { isFeatured: true }),

      ...(query.newArrival && { isNewArrival: true }),

      ...(query.bestSeller && { isBestSeller: true }),
    } satisfies ProductFilters;

    // Build the matching SQL conditions for the COUNT query
    const countConditions = [eq(products.isActive, true)];

    if (query.search) {
      countConditions.push(
        or(
          ilike(products.name, `%${query.search}%`),
          ilike(products.shortDescription, `%${query.search}%`),
          ilike(products.sku, `%${query.search}%`),
        )!,
      );
    }

    if (categoryId) {
      countConditions.push(eq(products.categoryId, categoryId));
    }

    if (brandIds && brandIds.length > 0) {
      countConditions.push(inArray(products.brandId, brandIds));
    }

    if (query.minPrice !== undefined) {
      countConditions.push(gte(products.price, String(query.minPrice)));
    }

    if (query.maxPrice !== undefined) {
      countConditions.push(lte(products.price, String(query.maxPrice)));
    }

    if (query.minRating !== undefined) {
      countConditions.push(gte(products.avgRating, String(query.minRating)));
    }

    if (query.inStock) {
      countConditions.push(gte(products.stock, 1));
    }

    if (query.featured) {
      countConditions.push(eq(products.isFeatured, true));
    }

    if (query.newArrival) {
      countConditions.push(eq(products.isNewArrival, true));
    }

    if (query.bestSeller) {
      countConditions.push(eq(products.isBestSeller, true));
    }

    const [rows, total] = await Promise.all([
      db.query.products.findMany({
        where: filters,
        orderBy,
        limit: query.limit,
        offset,
        with: {
          category: {
            columns: { id: true, name: true, slug: true },
          },
          brand: {
            columns: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { position: "asc" },
            limit: 3,
          },
        },
      }),

      db.$count(products, and(...countConditions)),
    ]);

    return Response.json({
      success: true,
      data: rows,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
