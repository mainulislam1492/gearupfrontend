import { ProviderNav } from "@/components/provider/provider-nav";
import { requireUser } from "@/lib/session";

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  await requireUser(["PROVIDER"]); // non-providers are redirected to their own dashboard
  return (
    <div className="space-y-6">
      <ProviderNav />
      {children}
    </div>
  );
}