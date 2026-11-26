import { Suspense } from "react";
import type { Metadata } from "next";
import { GearCard } from "@/components/gear-card";
import { GearGridSkeleton } from "@/components/gear-grid-skeleton";
import { Pagination } from "@/components/pagination";
import { GearFilters } from "@/components/gear-filters";
import { getCategories, getGearList, type GearQuery } from "@/lib/api";
export const metadata: Metadata = { title: "Browse Gear" };

type SP = Record<string, string | undefined>;

async function Results({ sp }: { sp: SP }) {
const { items, meta } = await getGearList(sp as GearQuery);
const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        No gear matches your filters.
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{meta.total} items found</p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((g) => <GearCard key={g.id} gear={g} />)}
      </div>
      <Pagination page={meta.page} totalPages={totalPages} searchParams={sp} />
    </>
  );
}

export default async function GearPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Browse Gear</h1>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Suspense>
          <GearFilters categories={categories} />
        </Suspense>
        <div>
          {/* key forces the skeleton to show again on every filter change */}
          <Suspense key={JSON.stringify(sp)} fallback={<GearGridSkeleton />}>
            <Results sp={sp} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}