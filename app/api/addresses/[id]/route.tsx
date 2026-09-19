import { NextRequest, NextResponse } from "next/server";
import { addresses } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { requireUser } from "@/lib/APIs/auth";
import { ApiError, handleApiError } from "@/lib/APIs/api-errors";
import { updateAddressSchema } from "@/lib/zod-validations/address";

// PATCH /api/addresses/[id]
// Update ONE address belonging to the logged-in user.
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await requireUser();

    const { id } = await params;

    /*
     * Find the address AND make sure it belongs
     * to the currently logged-in user.
     */
    const existingAddress = await db.query.addresses.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      throw new ApiError("Address not found", 404);
    }

    const input = updateAddressSchema.parse(await req.json());

    if (Object.keys(input).length === 0) {
      throw new ApiError("No fields provided to update", 400);
    }

    const updated = await db.transaction(async (tx) => {
      /*
       * If this address is being made the default,
       * remove default from other addresses of the same type.
       */
      if (input.isDefault) {
        const addressType = input.type ?? existingAddress.type;

        await tx
          .update(addresses)
          .set({
            isDefault: false,
          })
          .where(
            and(
              eq(addresses.userId, user.id),
              eq(addresses.type, addressType),
              ne(addresses.id, id),
            ),
          );
      }

      /*
       * Update only the address belonging to this user.
       */
      const [updatedAddress] = await tx
        .update(addresses)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
        .returning();

      return updatedAddress;
    });

    if (!updated) {
      throw new ApiError("Address update failed", 500);
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/addresses/[id]
// Delete ONE address belonging to the logged-in user.
export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await requireUser();

    const { id } = await params;

    /*
     * Delete only if the address belongs to the
     * currently authenticated user.
     */
    const [deletedAddress] = await db
      .delete(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
      .returning();

    if (!deletedAddress) {
      throw new ApiError("Address not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Address removed",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
