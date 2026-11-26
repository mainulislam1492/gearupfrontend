import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayPanel } from "@/components/customer/pay-panel";
import { PaymentStatusBadge } from "@/components/customer/payment-status-badge";
import { getOrderSoft, getPayment } from "@/lib/customer-server";
import { fmtDate, money } from "@/lib/format";
import { safe } from "@/lib/server-api";
import { paymentRentalId } from "@/lib/types";

export const metadata: Metadata = { title: "Payment details" };

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await getPayment(id); // 404 page if it is missing or belongs to someone else
  const rentalId = paymentRentalId(payment);

  // A failed payment can only be retried while the order is still waiting for payment
  let canRetry = false;
  if (payment.status.toUpperCase() === "FAILED" && rentalId) {
    const { data } = await safe(() => getOrderSoft(rentalId), null);
    canRetry = data?.status === "CONFIRMED";
  }

  const rows: [string, React.ReactNode][] = [
    ["Amount", money(payment.amount)],
    ["Method", payment.method ?? payment.gateway ?? payment.provider ?? "-"],
    ["Date", fmtDate(payment.createdAt)],
    ["Transaction", payment.transactionId ?? "-"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold">Payment <span className="font-mono">{payment.id.slice(-8)}</span></h1>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {canRetry && rentalId && (
        <Card>
          <CardHeader><CardTitle>Retry payment</CardTitle></CardHeader>
          <CardContent><PayPanel rentalId={rentalId} retry /></CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {rentalId && <Button asChild><Link href={`/customer/orders/${rentalId}`}>View order</Link></Button>}
        <Button variant="outline" asChild><Link href="/customer/payments">Back to payments</Link></Button>
      </div>
    </div>
  );
}