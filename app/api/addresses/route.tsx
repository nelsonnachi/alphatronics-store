import { NextRequest, NextResponse } from "next/server";
import { addresses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { requireUser } from "@/lib/APIs/auth";
import { ApiError, handleApiError } from "@/lib/APIs/api-errors";
import { addressSchema } from "@/lib/zod-validations/address";

// GET /api/addresses
// Get all addresses belonging to the logged-in user.
export async function GET() {
  try {
    const user = await requireUser();

    const rows = await db.query.addresses.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        isDefault: "desc",
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/addresses
// Create a new address for the logged-in user.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const input = addressSchema.parse(await req.json());

    const created = await db.transaction(async (tx) => {
      /*
       * If this address should become the default address,
       * remove the default flag from the user's existing
       * address of the same type.
       */
      if (input.isDefault) {
        await tx
          .update(addresses)
          .set({
            isDefault: false,
          })
          .where(
            and(eq(addresses.userId, user.id), eq(addresses.type, input.type)),
          );
      }

      /*
       * IMPORTANT:
       * userId comes from Clerk/authentication.
       * We do NOT trust the client to provide the userId.
       */
      const [newAddress] = await tx
        .insert(addresses)
        .values({
          ...input,
          userId: user.id,
        })
        .returning();

      if (!newAddress) {
        throw new ApiError("Address creation failed", 500);
      }

      return newAddress;
    });

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
