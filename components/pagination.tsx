import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Pagination({
  page, totalPages, searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => v && qs.set(k, v));
    qs.set("page", String(p));
    return `/gear?${qs.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline" disabled={page <= 1} asChild={page > 1}>
        {page > 1 ? <Link href={href(page - 1)}>Previous</Link> : <span>Previous</span>}
      </Button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span>...</span>}
          <Button variant={p === page ? "default" : "outline"} asChild>
            <Link href={href(p)}>{p}</Link>
          </Button>
        </span>
      ))}
      <Button variant="outline" disabled={page >= totalPages} asChild={page < totalPages}>
        {page < totalPages ? <Link href={href(page + 1)}>Next</Link> : <span>Next</span>}
      </Button>
    </nav>
  );
}