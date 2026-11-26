import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCount } from "@/lib/admin-server";
import { ADMIN } from "@/lib/endpoints";
import { safe } from "@/lib/server-api";
import { requireUser } from "@/lib/session";

export default async function AdminDashboard() {
  const user = await requireUser(["ADMIN"]);

  const results = await Promise.all([
    safe(() => getCount(ADMIN.users), null as number | null),
    safe(() => getCount(ADMIN.users, { status: "SUSPENDED" }), null as number | null),
    safe(() => getCount(ADMIN.gear), null as number | null),
    safe(() => getCount(ADMIN.rentals), null as number | null),
    safe(() => getCount(ADMIN.rentals, { status: "PLACED" }), null as number | null),
  ]);
  const errors = [...new Set(results.map((r) => r.error).filter(Boolean))] as string[];

  const stats = [
    { label: "Customers and providers", value: results[0].data, href: "/admin/users" },
    { label: "Suspended users", value: results[1].data, href: "/admin/users?status=SUSPENDED" },
    { label: "Gear listings", value: results[2].data, href: "/admin/gear" },
    { label: "Rental orders", value: results[3].data, href: "/admin/rentals" },
    { label: "Orders waiting for providers", value: results[4].data, href: "/admin/rentals?status=PLACED" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <p className="text-muted-foreground">Signed in as {user.email}</p>

      {errors.length > 0 && (
        <div className="space-y-1 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{s.value ?? "-"}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}