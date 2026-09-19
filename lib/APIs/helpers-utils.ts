// lib/APIs/helpers-utils.ts

import { cookies } from "next/headers";
import { randomInt, randomUUID } from "crypto";

export const GUEST_CART_COOKIE = "alphatronics_guest_cart";

const GUEST_CART_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Get or create guest cart session.
 */
export async function getOrCreateGuestSessionId(): Promise<string> {
  const cookieStore = await cookies();

  const existingSessionId = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = randomUUID();

  cookieStore.set(GUEST_CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: GUEST_CART_MAX_AGE,
    path: "/",
  });

  return sessionId;
}

/**
 * Get existing guest session.
 */
export async function getGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(GUEST_CART_COOKIE)?.value ?? null;
}

/**
 * Delete guest cart cookie.
 */
export async function clearGuestSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(GUEST_CART_COOKIE);
}

/**
 * Generate customer-friendly order number.
 *
 * Example:
 *
 * EM-20260901-4821
 */
export function generateOrderNumber(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const randomNumber = randomInt(1000, 10000);

  return `EM-${year}${month}${day}-${randomNumber}`;
}

/**
 * Generate unique Paystack reference.
 *
 * Example:
 *
 * PAY-EM-20260901-4821-123456
 */
export function generatePaymentReference(orderNumber: string): string {
  const randomNumber = randomInt(100000, 1000000);

  return `PAY-${orderNumber}-${randomNumber}`;
}


// Paystack expiration time
export const PAYSTACK_PAYMENT_EXPIRATION_MINUTES = 30;

export function getPaymentExpirationDate(): Date {
  return new Date(
    Date.now() +
      PAYSTACK_PAYMENT_EXPIRATION_MINUTES * 60 * 1000,
  );
}

/**
 * Tax rate.
 */
export const TAX_RATE = 0.075;

/**
 * Shipping prices in NGN.
 */
export const SHIPPING_RATES: Record<
  "standard" | "express" | "overnight",
  number
> = {
  standard: 0,
  express: 1500,
  overnight: 3500,
};

/**
 * Free standard shipping threshold.
 */
export const FREE_SHIPPING_THRESHOLD = 500;
