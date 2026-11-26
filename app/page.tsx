import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GearCard } from "@/components/gear-card";
import { getCategories, getGearList } from "@/lib/api";

export default async function HomePage() {
  const [categories, { items }] = await Promise.all([
    getCategories(),
    getGearList({ available: "true" }),
  ]);

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Rent the gear. <span className="text-primary">Skip the cost.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Browse sports and outdoor equipment from local rental shops, and pick it up when you are ready.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" asChild><Link href="/gear">Browse gear</Link></Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/categories">View categories</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">Shop by category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Button key={c.id} variant="outline" asChild>
              <Link href={`/gear?category=${c.id}`}>{c.name}</Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available now</h2>
          <Link href="/gear" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((g) => <GearCard key={g.id} gear={g} />)}
        </div>
      </section>
    </>
  );
}