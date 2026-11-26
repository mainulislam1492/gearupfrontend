import { AdminNav } from "@/components/admin/admin-nav";
import { requireUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireUser(["ADMIN"]); // everyone else is redirected to their own dashboard
  return (
    <div className="space-y-6">
      <AdminNav />
      {children}
    </div>
  );
}