// lib/APIs/auth.ts

import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

import { ApiError } from "@/lib/APIs/api-errors";

/**
 * Requires a logged-in, non-banned user.
 what this does "Make sure this request comes from a logged-in Clerk user, find that user in my PostgreSQL database, create the database user if they don't exist yet, make sure they aren't banned, then return the database user."
 */
export async function requireUser() {
  const { userId } = await auth();

  console.log("========== CLERK AUTH DEBUG ==========");
  console.log("Clerk userId:", userId);
  console.log("======================================");

  if (!userId) {
    throw new ApiError("Authentication required", 401);
  }

  const existingUser = await db.query.users.findFirst({
    where: { clerkId: userId },
  });

  if (existingUser) {
    if (existingUser.isBanned) {
      throw new ApiError("Your account has been suspended", 403);
    }
    return existingUser;
  }

  // Lets say the user signs up through Clerk. Clerk successfully creates the user profile  but for some reason your local PostgreSQL user wasn't created.

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new ApiError("Authentication required", 401);
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase();

  if (!email) {
    throw new ApiError("Your account does not have a valid email address", 400);
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      clerkId: userId,
      email: email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    })
    .onConflictDoNothing({ target: users.clerkId })
    .returning();

  if (createdUser) {
    return createdUser;
  }

  // Another request created this same user at the same time
  const syncedUser = await db.query.users.findFirst({
    where: { clerkId: userId },
  });

  if (!syncedUser) {
    throw new ApiError("Unable to create user account", 500);
  }

  if (syncedUser.isBanned) {
    throw new ApiError("Your account has been suspended", 403);
  }

  return syncedUser;
}

/**
 * Returns the current user if authenticated, or null if not.
 * Other errors (like a banned user) are allowed to propagate.
 */
export async function getOptionalUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return requireUser();
}

/**
 * Requires an admin or super_admin.
 */
export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new ApiError("Admin access required", 403);
  }

  return user;
}

/**
 * Requires a super_admin specifically.
 * Not currently used by any route — there is intentionally no
 * API path that grants super_admin status. That role can only
 * be set directly in the database. Keep this helper in case
 * that decision changes later.
 */
export async function requireSuperAdmin() {
  const user = await requireUser();

  if (user.role !== "super_admin") {
    throw new ApiError("Super admin access required", 403);
  }

  return user;
}
