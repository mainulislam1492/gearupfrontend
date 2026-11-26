import { CustomerNav } from "@/components/customer/customer-nav";
import { requireUser } from "@/lib/session";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireUser(["CUSTOMER"]); // providers and admins are redirected to their own dashboard
  return (
    <div className="space-y-6">
      <CustomerNav />
      {children}
    </div>
  );
}