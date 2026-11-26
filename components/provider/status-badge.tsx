import { Badge } from "@/components/ui/badge";

const STYLE: Record<string, string> = {
  PLACED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  PICKED_UP: "bg-purple-100 text-purple-800",
  RETURNED: "bg-slate-200 text-slate-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`border-0 ${STYLE[status] ?? ""}`}>
      {status.replace("_", " ")}
    </Badge>
  );
}