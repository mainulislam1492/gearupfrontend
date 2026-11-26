"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StripeElements } from "@/components/customer/stripe-elements";
import { createPayment } from "@/lib/customer-client";
import { PAYMENT_METHODS } from "@/lib/endpoints";

// Only these gateway hosts may be opened after "create payment"
const ALLOWED_HOSTS = ["stripe.com", "sslcommerz.com"];

function safeUrl(raw: unknown) {
  try {
    const u = new URL(String(raw));
    if (u.protocol !== "https:") return null;
    const ok = ALLOWED_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

export function PayPanel({ rentalId, retry }: { rentalId: string; retry?: boolean }) {
  const [method, setMethod] = useState(PAYMENT_METHODS[0].value);
  const [secret, setSecret] = useState<{ clientSecret: string; paymentId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await createPayment(rentalId, method);
      const d = res?.data ?? res;

      const raw = d?.url ?? d?.checkoutUrl ?? d?.paymentUrl ?? d?.GatewayPageURL ?? d?.gatewayUrl ?? d?.redirectUrl;
      if (raw) {
        const url = safeUrl(raw);
        if (!url) throw new Error("The payment link was not recognised as a trusted gateway.");
        window.location.href = url;
        return; // leave the button disabled while redirecting
      }

      if (d?.clientSecret) {
        setSecret({ clientSecret: d.clientSecret, paymentId: d.paymentId ?? d.id ?? d.payment?.id });
        setBusy(false);
        return;
      }

      throw new Error("The server did not return a payment link.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the payment");
      setBusy(false);
    }
  }

  if (secret) return <StripeElements clientSecret={secret.clientSecret} paymentId={secret.paymentId} />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {retry ? "The last payment failed. You can try again." : "The provider confirmed your order. Choose how to pay."}
      </p>
      <div className="flex flex-wrap gap-2">
        {PAYMENT_METHODS.map((m) => (
          <Button key={m.value} type="button" variant={method === m.value ? "default" : "outline"}
            onClick={() => setMethod(m.value)}>
            {m.label}
          </Button>
        ))}
      </div>
      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button onClick={start} disabled={busy}>
        {busy ? "Starting payment..." : retry ? "Retry payment" : "Pay now"}
      </Button>
    </div>
  );
}