import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);
    const eventType = event.type;

    // USER CREATED
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =  event.data;
      const email = email_addresses[0]?.email_address?.toLowerCase();

      if (!id || !email) {
        return Response.json(
          { success: false, error: "Missing required Clerk user information" },
          { status: 400 }
        );
      }

      await db.insert(users)
        .values({
          clerkId: id,
          email,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
          role: "customer",
        })
        .onConflictDoNothing({ target: users.clerkId });
    }

    // USER UPDATED
    else if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =  event.data;
      const email = email_addresses[0]?.email_address?.toLowerCase();

      if (!id || !email) {
        return Response.json(
          { success: false, error: "Missing required Clerk user information" },
          { status: 400 }
        );
      }

      await db.update(users)
        .set({
          email,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));

      console.log(`Clerk user updated: ${id}`);
    }

    // USER DELETED
    // We ban + scrub instead of hard-deleting. orders.userId uses
    // onDelete: "restrict", so a hard delete would fail (and keep
    // retrying, forever) for any customer who has placed an order.
    else if (eventType === "user.deleted") {
      const { id } = event.data;

      if (!id) {
        return Response.json(
          { success: false, error: "Missing Clerk user ID" },
          { status: 400 }
        );
      }

      await db.update(users)
        .set({
          isBanned: true,
          firstName: null,
          lastName: null,
          phone: null,
          imageUrl: null,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));
    }

    return Response.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    return Response.json(
      { success: false, error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
