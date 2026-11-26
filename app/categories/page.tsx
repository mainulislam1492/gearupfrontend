import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Gear Categories</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link key={c.id} href={`/gear?category=${c.id}`}>
            <Card className="h-full transition hover:shadow-lg">
              <CardHeader><CardTitle>{c.name}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {c.description ?? "Browse gear in this category"}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}