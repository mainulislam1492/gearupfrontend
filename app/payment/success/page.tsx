// "use client";

// import { Suspense, useEffect, useRef, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { apiFetch } from "../../../lib/http";

// function SuccessContent() {
//   const params = useSearchParams();
//   const transactionId = params.get("transactionId");
//   const [status, setStatus] = useState<"loading" | "paid" | "failed">("loading");
//   const [error, setError] = useState("");
//   const called = useRef(false);

//   useEffect(() => {
//     if (called.current) return; // avoid the double call in dev
//     called.current = true;

//     if (!transactionId) {
//       setStatus("failed");
//       setError("Missing transaction ID");
//       return;
//     }

//     // TODO: confirm this path and body match your backend route
//     apiFetch("/payments/confirm", {
//       method: "POST",
//       body: JSON.stringify({ transactionId }),
//     })
//       .then(() => setStatus("paid"))
//       .catch((e) => {
//         setStatus("failed");
//         setError(e?.message || "Unknown error");
//       });
//   }, [transactionId]);

//   if (status === "loading") return <p>Confirming your payment...</p>;
//   if (status === "failed")
//     return (
//       <div>
//         <p>We couldn&apos;t confirm your payment.</p>
//         <p>Reason: {error}</p>
//       </div>
//     );

//   return (
//     <div>
//       <h1>Payment successful ✅</h1>
//       <p>Status: Paid</p>
//       <p>Transaction ID: {transactionId}</p>
//     </div>
//   );
// }

// export default function PaymentSuccessPage() {
//   return (
//     <Suspense fallback={<p>Loading...</p>}>
//       <SuccessContent />
//     </Suspense>
//   );
// }




"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/http";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const transactionId = params.get("transactionId");
  const [status, setStatus] = useState<"loading" | "paid" | "failed">("loading");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return; // avoid the double call in dev
    called.current = true;

    if (!transactionId) {
      setStatus("failed");
      setError("Missing transaction ID");
      return;
    }

    apiFetch("/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ transactionId }),
    })
      .then(() => setStatus("paid"))
      .catch((e) => {
        setStatus("failed");
        setError(e?.message || "Unknown error");
      });
  }, [transactionId]);

  const handleOk = () => {
    router.push("/customer/orders");
  };

  const handleCopy = async () => {
    if (!transactionId) return;
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable; ignore
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            We couldn&apos;t confirm your payment
          </h1>
          <p className="mb-6 text-sm text-gray-500">Reason: {error}</p>
          <button
            onClick={handleOk}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-1 text-2xl font-bold text-gray-900">Payment Successful</h1>
        <p className="mb-6 text-gray-500">
          Thank you! Your payment has been received and your order is being processed.
        </p>

        <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
          <p className="text-xs uppercase tracking-wide text-gray-400">Transaction ID</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="break-all font-mono text-sm text-gray-800">{transactionId}</p>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">Paid</span>
          </div>
        </div>

        <button
          onClick={handleOk}
          className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}