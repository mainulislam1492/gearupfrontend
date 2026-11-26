import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pager } from "@/components/admin/pager";
import { UserStatusButton } from "@/components/admin/user-status-button";
import { getAdminUsers, pagesOf } from "@/lib/admin-server";
import { fmtDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { USER_ROLES, USER_STATUSES } from "@/lib/types";

export const metadata: Metadata = { title: "Users" };

const select = "h-9 rounded-md border bg-background px-3 text-sm";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; q?: string; page?: string }>;
}) {
  const me = await requireUser(["ADMIN"]);
  const sp = await searchParams;

  // Only known values reach the backend
  const role = USER_ROLES.find((r) => r === sp.role);
  const status = USER_STATUSES.find((s) => s === sp.status);
  const q = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const { items, meta } = await getAdminUsers({ role, status, searchTerm: q, page });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Users {meta.total != null && <span className="text-muted-foreground">({meta.total})</span>}
      </h1>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <Input name="q" defaultValue={q} placeholder="Search name or email" className="w-64" maxLength={100} />
        <select name="role" defaultValue={role ?? ""} className={select}>
          <option value="">All roles</option>
          {USER_ROLES.map((r) => <option key={r} value={r}>{r.toLowerCase()}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""} className={select}>
          <option value="">All statuses</option>
          {USER_STATUSES.map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
        </select>
        <Button type="submit">Apply</Button>
        <Button type="button" variant="outline" asChild><Link href="/admin/users">Reset</Link></Button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => {
                const suspended = u.status?.toUpperCase() === "SUSPENDED";
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell className="capitalize">{u.role?.toLowerCase()}</TableCell>
                    <TableCell>{u.profile?.shopName ?? "-"}</TableCell>
                    <TableCell>{fmtDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={suspended ? "destructive" : "default"}>{u.status?.toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <UserStatusButton id={u.id} role={u.role} status={u.status} isSelf={u.id === me.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pager basePath="/admin/users" page={page} totalPages={pagesOf(meta)}
        params={{ q: q || undefined, role, status }} />
    </div>
  );
}