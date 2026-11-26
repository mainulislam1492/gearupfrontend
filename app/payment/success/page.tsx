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

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/http";
import { CUSTOMER } from "../../../lib/endpoints";

const DASHBOARD_PATH = "/customers/order";

function SuccessContent() {
  const params = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const body = CUSTOMER.confirmBody({
      sessionId: params.get("session_id") || params.get("sessionId"),
      paymentIntentId: params.get("payment_intent") || params.get("paymentIntentId"),
      paymentId: params.get("paymentId") || params.get("payment_id"),
    });

    const goToDashboard = () => {
      // uses the current domain, so it can never go to localhost on Vercel
      window.location.replace(`${window.location.origin}${DASHBOARD_PATH}`);
    };

    if (Object.keys(body).length === 0) {
      goToDashboard();
      return;
    }

    apiFetch(CUSTOMER.paymentConfirm, {
      method: "POST",
      body: JSON.stringify(body),
    })
      .catch(() => {})       // even if confirm fails, still go to the dashboard
      .finally(goToDashboard);
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
        <p className="font-medium text-gray-800">Payment successful</p>
        <p className="text-sm text-gray-500">Taking you to your orders...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<p className="p-6 text-gray-600">Loading...</p>}>
      <SuccessContent />
    </Suspense>
  );
}