"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/api";
import type { Category } from "@/lib/types";

const ALL = "all";

export function GearFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [brand, setBrand] = useState(params.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    next.delete("page"); // any filter change resets to page 1
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  // Debounced search
  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function reset() {
    setQ(""); setBrand(""); setMinPrice(""); setMaxPrice("");
    startTransition(() => router.push(pathname));
  }

  return (
    <aside className={`space-y-5 rounded-lg border p-4 ${pending ? "opacity-70" : ""}`}>
      <div className="space-y-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          placeholder="Name, brand or description"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={params.get("category") ?? ALL}
          onValueChange={(v) => update({ category: v === ALL ? null : v })}
        >
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <Input
          id="brand"
          placeholder="e.g. Nike"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && update({ brand: brand.trim() || null })}
          onBlur={() => update({ brand: brand.trim() || null })}
        />
      </div>

      <div className="space-y-2">
        <Label>Price per day</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} placeholder="Min" value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)} />
          <span>-</span>
          <Input type="number" min={0} placeholder="Max" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <Button size="sm" variant="secondary" className="w-full"
          onClick={() => update({ minPrice: minPrice || null, maxPrice: maxPrice || null })}>
          Apply price
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <Select
          value={params.get("available") ?? ALL}
          onValueChange={(v) => update({ available: v === ALL ? null : v })}
        >
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any</SelectItem>
            <SelectItem value="true">Available only</SelectItem>
            <SelectItem value="false">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select
          value={params.get("sort") ?? "newest"}
          onValueChange={(v) => update({ sort: v })}
        >
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={reset}>Reset filters</Button>
    </aside>
  );
}