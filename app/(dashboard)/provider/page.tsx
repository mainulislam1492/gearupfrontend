import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyGear, getProviderOrders, safe } from "@/lib/provider-server";
import { requireUser } from "@/lib/session";

export default async function ProviderDashboard() {
  const user = await requireUser(["PROVIDER"]);

  // Each loader is isolated, so one failing endpoint cannot crash the whole page
  const [gearRes, ordersRes] = await Promise.all([
    safe(getMyGear, []),
    safe(() => getProviderOrders(), []),
  ]);

  const gear = gearRes.data;
  const orders = ordersRes.data;
  const problems = [
    gearRes.error && `Gear: ${gearRes.error}`,
    ordersRes.error && `Orders: ${ordersRes.error}`,
  ].filter(Boolean) as string[];

  const count = (s: string) => orders.filter((o) => o.status === s).length;

  const stats = [
    { label: "Gear listed", value: gear.length, href: "/provider/gear" },
    {
      label: "Low stock (2 or fewer)",
      value: gear.filter((g) => (g.stock ?? 0) <= 2).length,
      href: "/provider/gear",
    },
    { label: "New orders to confirm", value: count("PLACED"), href: "/provider/orders?status=PLACED" },
    { label: "Ready for pickup (paid)", value: count("PAID"), href: "/provider/orders?status=PAID" },
    { label: "Out with customers", value: count("PICKED_UP"), href: "/provider/orders?status=PICKED_UP" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <Button asChild>
          <Link href="/provider/gear/new">Add gear</Link>
        </Button>
      </div>

      {problems.length > 0 && (
        <div className="space-y-1 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {problems.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}

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