import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderActions } from "@/components/provider/order-actions";
import { StatusBadge } from "@/components/provider/status-badge";
import { getProviderOrders } from "@/lib/provider-server";
import { ORDER_STATUSES, orderGearNames } from "@/lib/types";

export const metadata: Metadata = { title: "Incoming Orders" };

const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString() : "-");

export default async function ProviderOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = ORDER_STATUSES.find((s) => s === sp.status);
  const orders = await getProviderOrders(status);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Incoming orders</h1>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={!status ? "default" : "outline"} asChild>
          <Link href="/provider/orders">All</Link>
        </Button>
        {ORDER_STATUSES.map((s) => (
          <Button key={s} size="sm" variant={status === s ? "default" : "outline"} asChild>
            <Link href={`/provider/orders?status=${s}`}>{s.replace("_", " ")}</Link>
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No orders found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Gear</TableHead>
                <TableHead>Rental dates</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(-8)}</TableCell>
                  <TableCell>
                    <p>{o.customer?.name ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">{o.customer?.phone ?? o.customer?.email}</p>
                  </TableCell>
                  <TableCell>{orderGearNames(o)}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmt(o.startDate)} to {fmt(o.endDate)}</TableCell>
                  <TableCell>{o.totalPrice ?? o.totalAmount ?? "-"}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell><OrderActions id={o.id} status={o.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}