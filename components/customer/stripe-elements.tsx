"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = key ? loadStripe(key) : null;

function CheckoutForm({ paymentId }: { paymentId?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);

    const returnUrl =
      `${window.location.origin}/customer/payments/return` +
      (paymentId ? `?paymentId=${encodeURIComponent(paymentId)}` : "");

    const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
    // Only reached if the payment could not start; otherwise Stripe redirects
    if (error) {
      setError(error.message ?? "Payment failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!stripe || busy}>{busy ? "Processing..." : "Pay"}</Button>
    </form>
  );
}

export function StripeElements({ clientSecret, paymentId }: { clientSecret: string; paymentId?: string }) {
  if (!stripePromise) {
    return <p className="text-sm text-destructive">Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local and restart the server.</p>;
  }
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm paymentId={paymentId} />
    </Elements>
  );
}