import { Badge } from "@/components/ui/badge";

const STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  SUCCEEDED: "bg-emerald-100 text-emerald-800",
  PAID: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  return <Badge variant="outline" className={`border-0 ${STYLE[s] ?? ""}`}>{s.toLowerCase()}</Badge>;
}