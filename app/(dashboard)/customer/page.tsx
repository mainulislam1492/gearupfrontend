import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyOrders } from "@/lib/customer-server";
import { safe } from "@/lib/server-api";
import { requireUser } from "@/lib/session";

export default async function CustomerDashboard() {
  const user = await requireUser(["CUSTOMER"]);
  const { data: orders, error } = await safe(() => getMyOrders(), []);

  const count = (s: string) => orders.filter((o) => o.status === s).length;
  const stats = [
    { label: "All orders", value: orders.length, href: "/customer/orders" },
    { label: "Waiting for the provider", value: count("PLACED"), href: "/customer/orders?status=PLACED" },
    { label: "Ready to pay", value: count("CONFIRMED"), href: "/customer/orders?status=CONFIRMED" },
    { label: "Gear in your hands", value: count("PICKED_UP"), href: "/customer/orders?status=PICKED_UP" },
    { label: "Returned, leave a review", value: count("RETURNED"), href: "/customer/orders?status=RETURNED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <Button asChild><Link href="/gear">Browse gear</Link></Button>
      </div>
      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">Orders: {error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{s.value}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}