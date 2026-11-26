import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GearModerationButton } from "@/components/admin/gear-moderation-button";
import { Pager } from "@/components/admin/pager";
import { getAdminGear, pagesOf } from "@/lib/admin-server";
import { money } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { gearHidden } from "@/lib/types";

export const metadata: Metadata = { title: "Gear listings" };

export default async function AdminGearPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireUser(["ADMIN"]);
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const { items, meta } = await getAdminGear({ searchTerm: q, page });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Gear listings {meta.total != null && <span className="text-muted-foreground">({meta.total})</span>}
      </h1>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <Input name="q" defaultValue={q} placeholder="Search gear" className="w-64" maxLength={100} />
        <Button type="submit">Search</Button>
        <Button type="button" variant="outline" asChild><Link href="/admin/gear">Reset</Link></Button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No gear found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gear</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price / day</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Moderation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((g) => {
                const hidden = gearHidden(g);
                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <p className="font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.brand}</p>
                    </TableCell>
                    <TableCell>{g.provider?.shopName ?? g.provider?.name ?? "-"}</TableCell>
                    <TableCell>{g.category?.name ?? "-"}</TableCell>
                    <TableCell>{money(g.pricePerDay)}</TableCell>
                    <TableCell>{g.stock ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={hidden ? "destructive" : "default"}>{hidden ? "Hidden" : "Visible"}</Badge>
                    </TableCell>
                    <TableCell><GearModerationButton id={g.id} hidden={hidden} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pager basePath="/admin/gear" page={page} totalPages={pagesOf(meta)} params={{ q: q || undefined }} />
    </div>
  );
}