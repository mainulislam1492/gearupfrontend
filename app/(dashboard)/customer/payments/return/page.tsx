import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentReturn } from "@/components/customer/payment-return";

export const metadata: Metadata = { title: "Payment result" };

export default function PaymentReturnPage() {
  return (
    <Suspense>
      <PaymentReturn />
    </Suspense>
  );
}