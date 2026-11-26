import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/provider/status-badge";
import { getMyOrders } from "@/lib/customer-server";
import { fmtDate, money } from "@/lib/format";
import { ORDER_STATUSES, orderGearNames, orderTotal } from "@/lib/types";

export const metadata: Metadata = { title: "My Orders" };

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = ORDER_STATUSES.find((s) => s === sp.status); // only known values reach the backend
  const orders = await getMyOrders(status);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My orders</h1>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={!status ? "default" : "outline"} asChild>
          <Link href="/customer/orders">All</Link>
        </Button>
        {ORDER_STATUSES.map((s) => (
          <Button key={s} size="sm" variant={status === s ? "default" : "outline"} asChild>
            <Link href={`/customer/orders?status=${s}`}>{s.replace("_", " ")}</Link>
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No orders found. <Link href="/gear" className="text-primary hover:underline">Browse gear</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Gear</TableHead>
                <TableHead>Rental dates</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(-8)}</TableCell>
                  <TableCell>{orderGearNames(o)}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDate(o.startDate)} to {fmtDate(o.endDate)}</TableCell>
                  <TableCell>{money(orderTotal(o))}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/customer/orders/${o.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}