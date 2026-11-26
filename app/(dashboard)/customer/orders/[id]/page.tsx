import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CancelButton } from "@/components/customer/cancel-button";
import { OrderTracker } from "@/components/customer/order-tracker";
import { PayPanel } from "@/components/customer/pay-panel";
import { ReviewForm } from "@/components/customer/review-form";
import { StatusBadge } from "@/components/provider/status-badge";
import { getOrder } from "@/lib/customer-server";
import { fmtDate, money } from "@/lib/format";
import { orderItems, orderTotal } from "@/lib/types";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id); // 404 page if it is missing or belongs to someone else
  const items = orderItems(order);
  const total = orderTotal(order);
  const shop = order.provider?.shopName ?? order.provider?.name;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Order <span className="font-mono">{order.id.slice(-8)}</span>
          </h1>
          <p className="text-sm text-muted-foreground">Placed on {fmtDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <Card>
        <CardContent className="pt-6"><OrderTracker status={order.status} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y rounded-md border">
            {items.map((i, idx) => (
              <li key={idx} className="flex justify-between p-3 text-sm">
                <span>{i.name}</span>
                <span className="text-muted-foreground">x {i.quantity}</span>
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Rental dates</dt>
            <dd>{fmtDate(order.startDate)} to {fmtDate(order.endDate)}</dd>
            {shop && (<><dt className="text-muted-foreground">Provided by</dt><dd>{shop}</dd></>)}
            {order.depositAmount != null && (
              <><dt className="text-muted-foreground">Deposit</dt><dd>{money(order.depositAmount)}</dd></>
            )}
            <dt className="font-medium">Total</dt>
            <dd className="font-medium">{money(total)}</dd>
          </dl>
        </CardContent>
      </Card>

      {order.status === "PLACED" && (
        <Card>
          <CardHeader><CardTitle>Waiting for the provider</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You can pay once the provider confirms. Until then you can still cancel.
            </p>
            <CancelButton id={order.id} />
          </CardContent>
        </Card>
      )}

      {order.status === "CONFIRMED" && (
        <Card>
          <CardHeader><CardTitle>Pay for this order</CardTitle></CardHeader>
          <CardContent><PayPanel rentalId={order.id} /></CardContent>
        </Card>
      )}

      {order.status === "RETURNED" && (
        <Card>
          <CardHeader><CardTitle>Leave a review</CardTitle></CardHeader>
          <CardContent><ReviewForm rentalId={order.id} items={items} /></CardContent>
        </Card>
      )}

      <Button variant="outline" asChild><Link href="/customer/orders">Back to orders</Link></Button>
    </div>
  );
}