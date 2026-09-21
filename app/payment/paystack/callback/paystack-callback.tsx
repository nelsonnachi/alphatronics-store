"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ============================================================
// TYPES
// ============================================================

type PaymentState = "verifying" | "success" | "failed";

type PaymentResponse = {
  success: boolean;

  data?: {
    orderId: string;
    orderNumber: string;
    paymentStatus: string;
    orderStatus: string;
  };

  message?: string;
};

// ============================================================
// PAYSTACK CALLBACK
// ============================================================

export default function PaystackCallback() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [state, setState] =
    useState<PaymentState>("verifying");

  const [message, setMessage] = useState(
    "Verifying your payment...",
  );

  const [orderNumber, setOrderNumber] =
    useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // ========================================================
      // 1. GET REFERENCE FROM URL
      // ========================================================

      const reference = searchParams.get("reference");

      if (!reference) {
        setState("failed");

        setMessage("Payment reference was not found.");

        return;
      }

      // ========================================================
      // 2. SEND REFERENCE TO BACKEND
      // ========================================================

      try {
        const response = await fetch(
          "/api/payments/paystack/verify",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              reference,
            }),
          },
        );

        // ======================================================
        // 3. READ RESPONSE
        // ======================================================

        const result: PaymentResponse =
          await response.json();

        // ======================================================
        // 4. PAYMENT FAILED
        // ======================================================

        if (!response.ok || !result.success) {
          setState("failed");

          setMessage(
            result.message ||
              "Your payment was not completed.",
          );

          return;
        }

        // ======================================================
        // 5. PAYMENT SUCCESSFUL
        // ======================================================

        setState("success");

        setOrderNumber(
          result.data?.orderNumber ?? null,
        );

        setMessage(
          "Your payment was successful!",
        );

        // ======================================================
        // 6. REDIRECT TO ORDER
        // ======================================================

        if (result.data?.orderId) {
          setTimeout(() => {
            router.push(
              `/orders/${result.data?.orderId}`,
            );
          }, 2000);
        }
      } catch (error) {
        console.error(
          "Payment verification error:",
          error,
        );

        setState("failed");

        setMessage(
          "Something went wrong while verifying your payment. Please contact support if money was deducted.",
        );
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  // ==========================================================
  // VERIFYING
  // ==========================================================

  if (state === "verifying") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <h1 className="text-2xl font-semibold">
            Verifying payment
          </h1>

          <p className="mt-2 text-gray-600">
            Please wait while we confirm your payment
            with Paystack.
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (state === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl text-green-600">
              ✓
            </span>
          </div>

          <h1 className="text-3xl font-bold">
            Payment successful
          </h1>

          <p className="mt-3 text-gray-600">
            {message}
          </p>

          {orderNumber && (
            <p className="mt-4 text-sm text-gray-500">
              Order number:{" "}
              <span className="font-medium text-gray-900">
                {orderNumber}
              </span>
            </p>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Redirecting you to your order...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================
  // FAILED
  // ==========================================================

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl text-red-600">
            ×
          </span>
        </div>

        <h1 className="text-3xl font-bold">
          Payment could not be verified
        </h1>

        <p className="mt-3 text-gray-600">
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="rounded-lg bg-black px-5 py-3 text-white transition hover:opacity-90"
          >
            Return to checkout
          </button>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="rounded-lg border border-gray-300 px-5 py-3 transition hover:bg-gray-50"
          >
            View my orders
          </button>
        </div>
      </div>
    </main>
  );
}