import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GearRowActions } from "@/components/provider/gear-row-actions";
import { getMyGear } from "@/lib/provider-server";

export const metadata: Metadata = { title: "My Gear" };

export default async function ProviderGearPage() {
  const gear = await getMyGear();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My gear ({gear.length})</h1>
        <Button asChild><Link href="/provider/gear/new">Add gear</Link></Button>
      </div>

      {gear.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          You have not listed any gear yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price / day</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock and actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gear.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    <p className="font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.brand}</p>
                  </TableCell>
                  <TableCell>{g.category?.name ?? "-"}</TableCell>
                  <TableCell>${g.pricePerDay}</TableCell>
                  <TableCell>{g.deposit != null ? `$${g.deposit}` : "-"}</TableCell>
                  <TableCell className="space-x-1">
                    <Badge variant={g.isAvailable ? "default" : "secondary"}>
                      {g.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                    {g.isHidden && <Badge variant="outline">Hidden</Badge>}
                  </TableCell>
                  <TableCell>
                    <GearRowActions id={g.id} stock={g.stock ?? 0} isAvailable={g.isAvailable} />
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