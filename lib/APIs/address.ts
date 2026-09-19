import { db } from "@/db/drizzle";

import { ApiError } from "@/lib/APIs/api-errors";

/**
 * Get an address belonging to a specific user.
 *
 * This prevents a user from using another user's address.
 */
export async function getUserAddress(
  addressId: string,
  userId: string,
) {
  const address = await db.query.addresses.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new ApiError("Address not found", 404);
  }

  return address;
}