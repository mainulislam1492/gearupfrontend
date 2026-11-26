"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { confirmPayment } from "@/lib/customer-client";

type State = { kind: "working" | "ok" | "failed" | "info"; text: string };

export function PaymentReturn() {
  const params = useSearchParams();
  const ran = useRef(false);
  const [state, setState] = useState<State>({ kind: "working", text: "Verifying your payment..." });

  useEffect(() => {
    if (ran.current) return; // React strict mode runs effects twice in development
    ran.current = true;

    const paymentIntentId = params.get("payment_intent");
    const sessionId = params.get("session_id");
    const paymentId = params.get("paymentId");
    const status = (params.get("redirect_status") ?? params.get("status") ?? "").toLowerCase();

    if (["failed", "cancelled", "canceled"].includes(status)) {
      setState({ kind: "failed", text: "The payment was not completed. You can retry it from your order." });
      return;
    }

    if (!paymentIntentId && !sessionId) {
      // For example SSLCommerz: the backend verifies it on its own
      setState({ kind: "info", text: "We are processing your payment. Check your payment history for the final status." });
      return;
    }

    // Asks the server to verify with Stripe. This page never decides success on its own.
    confirmPayment({ paymentIntentId, sessionId, paymentId })
      .then(() => setState({ kind: "ok", text: "Payment received. Your order is being updated." }))
      .catch((e) =>
        setState({ kind: "failed", text: e instanceof Error ? e.message : "We could not verify the payment." }),
      );
  }, [params]);

  const color = {
    working: "bg-muted", ok: "bg-emerald-50 text-emerald-800",
    failed: "bg-red-50 text-red-800", info: "bg-blue-50 text-blue-800",
  }[state.kind];

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Payment</h1>
      <p className={`rounded-md p-4 text-sm ${color}`}>{state.text}</p>
      <div className="flex gap-2">
        <Button asChild><Link href="/customer/payments">Payment history</Link></Button>
        <Button variant="outline" asChild><Link href="/customer/orders">My orders</Link></Button>
      </div>
    </div>
  );
}