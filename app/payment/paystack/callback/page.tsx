import { Suspense } from "react";

import PaystackCallback from "./paystack-callback";

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

        <h1 className="text-2xl font-semibold">
          Verifying payment
        </h1>

        <p className="mt-2 text-gray-600">
          Please wait while we confirm your payment with Paystack.
        </p>
      </div>
    </main>
  );
}

export default function PaystackCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaystackCallback />
    </Suspense>
  );
}