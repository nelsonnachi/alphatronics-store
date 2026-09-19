import { ApiError } from "@/lib/APIs/api-errors";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

type CreatePaystackRefundInput = {
  transaction: string;

  amount: number;

  currency: string;

  customerNote?: string;

  merchantNote?: string;
};

type PaystackRefundResponse = {
  status: boolean;

  message: string;

  data?: {
    id: number | string;

    status: string;

    transaction: number | string;

    amount: number;

    currency: string;

    customer_note?: string;

    merchant_note?: string;

    createdAt?: string;

    updatedAt?: string;
  };
};

function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new ApiError("PAYSTACK_SECRET_KEY is not configured", 500);
  }

  return secretKey;
}

export async function createPaystackRefund(input: CreatePaystackRefundInput) {
  const amountInKobo = Math.round(input.amount * 100);

  const response = await fetch(`${PAYSTACK_BASE_URL}/refund`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      transaction: input.transaction,

      amount: amountInKobo,

      currency: input.currency,

      customer_note: input.customerNote,

      merchant_note: input.merchantNote,
    }),
  });

  const result = (await response.json()) as PaystackRefundResponse;

  if (!response.ok || !result.status || !result.data) {
    throw new ApiError(
      result.message || "Unable to create Paystack refund",
      502
    );
  }

  return result.data;
}
