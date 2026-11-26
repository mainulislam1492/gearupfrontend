import { requireUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser(); // server-side check, runs even if the proxy is bypassed
  return <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>;
}