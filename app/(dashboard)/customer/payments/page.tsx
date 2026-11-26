import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/customer/payment-status-badge";
import { getMyPayments } from "@/lib/customer-server";
import { fmtDate, money } from "@/lib/format";
import { paymentRentalId } from "@/lib/types";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const payments = await getMyPayments();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payment history</h1>

      {payments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No payments yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const rentalId = paymentRentalId(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell>{fmtDate(p.createdAt)}</TableCell>
                    <TableCell>
                      {rentalId ? (
                        <Link className="font-mono text-xs text-primary hover:underline" href={`/customer/orders/${rentalId}`}>
                          {rentalId.slice(-8)}
                        </Link>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{p.method ?? p.gateway ?? p.provider ?? "-"}</TableCell>
                    <TableCell>{money(p.amount)}</TableCell>
                    <TableCell><PaymentStatusBadge status={p.status} /></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/customer/payments/${p.id}`}>Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}