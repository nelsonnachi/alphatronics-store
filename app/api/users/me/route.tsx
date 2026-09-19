// app/api/users/me/route.ts

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/APIs/auth";
import { handleApiError } from "@/lib/APIs/api-errors";
import { updateUserSchema } from "@/lib/zod-validations/user";

export const runtime = "nodejs";

// ============================================================
// GET CURRENT USER
// ============================================================

export async function GET() {
  try {
    const user = await requireUser();

    return Response.json({
      success: true,

      data: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// UPDATE CURRENT USER
// ============================================================

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json();

    const data = updateUserSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return Response.json(
        {
          success: false,

          error: "No changes provided",
        },
        {
          status: 400,
        },
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,

        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return Response.json({
      success: true,

      data: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
