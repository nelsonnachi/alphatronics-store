// lib/payments/paystack.ts

import { ApiError } from "@/lib/APIs/api-errors";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

type InitializePaystackInput = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata: {
    orderId: string;
    orderNumber: string;
    paymentId: string;
  };
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata?: {
      orderId?: string;
      orderNumber?: string;
      paymentId?: string;
    };
  };
};

function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new ApiError(
      "PAYSTACK_SECRET_KEY is not configured",
      500,
    );
  }

  return secretKey;
}


/**
 * Initialize a Paystack transaction.
 *
 * Paystack expects the amount in the smallest
 * currency unit, so NGN 5,000 becomes 500000.
 */
export async function initializePaystackTransaction(
  input: InitializePaystackInput,
) {
  const amountInKobo = Math.round(input.amount * 100);

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: input.email,

        amount: String(amountInKobo),

        currency: "NGN",

        reference: input.reference,

        callback_url: input.callbackUrl,

        metadata: input.metadata,
      }),
    },
  );

  const result =
    (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !result.status || !result.data) {
    throw new ApiError(
      result.message || "Unable to initialize Paystack transaction",
      502,
    );
  }

  return result.data;
}


/**
 * Verify a Paystack transaction.
 */
export async function verifyPaystackTransaction(
  reference: string,
) {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(
      reference,
    )}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
      },

      cache: "no-store",
    },
  );

  const result =
    (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !result.status || !result.data) {
    throw new ApiError(
      result.message || "Unable to verify Paystack transaction",
      502,
    );
  }

  return result.data;
}