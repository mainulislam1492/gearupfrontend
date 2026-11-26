import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Pager({
  basePath, page, totalPages, params,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && qs.set(k, v));
    qs.set("page", String(p));
    return `${basePath}?${qs.toString()}`;
  };

  return (
    <nav className="flex items-center justify-center gap-3">
      {page > 1 ? (
        <Button variant="outline" asChild><Link href={href(page - 1)}>Previous</Link></Button>
      ) : (
        <Button variant="outline" disabled>Previous</Button>
      )}
      <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
      {page < totalPages ? (
        <Button variant="outline" asChild><Link href={href(page + 1)}>Next</Link></Button>
      ) : (
        <Button variant="outline" disabled>Next</Button>
      )}
    </nav>
  );
}