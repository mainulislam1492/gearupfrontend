import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pager } from "@/components/admin/pager";
import { StatusBadge } from "@/components/provider/status-badge";
import { getAdminRentals } from "@/lib/admin-server";
import { fmtDate, money } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { ORDER_STATUSES, orderGearNames, orderTotal } from "@/lib/types";

export const metadata: Metadata = { title: "All orders" };

const PAGE_SIZE = 20;
const select = "h-9 rounded-md border bg-background px-3 text-sm";

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; customer?: string; provider?: string; page?: string }>;
}) {
  await requireUser(["ADMIN"]);
  const sp = await searchParams;

  const status = ORDER_STATUSES.find((s) => s === sp.status);
  const customer = (sp.customer ?? "").trim().slice(0, 100);
  const provider = (sp.provider ?? "").trim().slice(0, 100);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const all = await getAdminRentals({ status, customer, provider });
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        All rental orders <span className="text-muted-foreground">({all.length})</span>
      </h1>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <Input name="customer" defaultValue={customer} placeholder="Customer name or email" className="w-56" maxLength={100} />
        <Input name="provider" defaultValue={provider} placeholder="Provider or shop" className="w-56" maxLength={100} />
        <select name="status" defaultValue={status ?? ""} className={select}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <Button type="submit">Apply</Button>
        <Button type="button" variant="outline" asChild><Link href="/admin/rentals">Reset</Link></Button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No orders found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Gear</TableHead>
                <TableHead>Rental dates</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(-8)}</TableCell>
                  <TableCell>
                    <p>{o.customer?.name ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">{o.customer?.email}</p>
                  </TableCell>
                  <TableCell>{o.provider?.shopName ?? o.provider?.name ?? "-"}</TableCell>
                  <TableCell>{orderGearNames(o)}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDate(o.startDate)} to {fmtDate(o.endDate)}</TableCell>
                  <TableCell>{money(orderTotal(o))}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pager basePath="/admin/rentals" page={current} totalPages={totalPages}
        params={{ status, customer: customer || undefined, provider: provider || undefined }} />
    </div>
  );
}