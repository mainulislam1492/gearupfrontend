"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGear, updateGear } from "@/lib/provider-client";
import type { Category, Gear } from "@/lib/types";

export function GearForm({ categories, gear }: { categories: Category[]; gear?: Gear }) {
  const router = useRouter();

  const [f, setF] = useState({
    name: gear?.name ?? "",
    brand: gear?.brand ?? "",
    description: gear?.description ?? "",
    categoryId: gear?.category?.id ?? gear?.categoryId ?? "",
    pricePerDay: gear?.pricePerDay != null ? String(gear.pricePerDay) : "",
    deposit: gear?.deposit != null ? String(gear.deposit) : "0",
    stock: gear?.stock != null ? String(gear.stock) : "1",
    images: (gear?.images ?? []).join("\n"),
  });
  const [specs, setSpecs] = useState<{ k: string; v: string }[]>(
    gear?.specifications && typeof gear.specifications === "object"
      ? Object.entries(gear.specifications).map(([k, v]) => ({ k, v: String(v) }))
      : [{ k: "", v: "" }],
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((s) => ({ ...s, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(f.pricePerDay);
    const deposit = Number(f.deposit);
    const stock = Number(f.stock);
    if (!f.categoryId) return setError("Please choose a category.");
    if (!(price > 0)) return setError("Price per day must be greater than 0.");
    if (!(deposit >= 0)) return setError("Deposit cannot be negative.");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stock must be a whole number, 0 or more.");

    const body = {
      name: f.name.trim(),
      brand: f.brand.trim(),
      description: f.description.trim(),
      categoryId: f.categoryId,
      specifications: Object.fromEntries(
        specs.filter((s) => s.k.trim()).map((s) => [s.k.trim(), s.v.trim()]),
      ),
      images: f.images.split("\n").map((s) => s.trim()).filter(Boolean),
      pricePerDay: price,
      deposit,
      stock,
    };

    setBusy(true);
    try {
      if (gear) await updateGear(gear.id, body);
      else await createGear(body);
      router.push("/provider/gear");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save gear");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={f.name} onChange={set("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" required value={f.brand} onChange={set("brand")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={f.categoryId} onValueChange={(v) => setF((s) => ({ ...s, categoryId: v }))}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Choose a category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} required value={f.description} onChange={set("description")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price per day</Label>
          <Input id="price" type="number" min={0} step="0.01" required value={f.pricePerDay} onChange={set("pricePerDay")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit">Deposit</Label>
          <Input id="deposit" type="number" min={0} step="0.01" required value={f.deposit} onChange={set("deposit")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" min={0} step={1} required value={f.stock} onChange={set("stock")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Image URLs (one per line)</Label>
        <Textarea id="images" rows={3} placeholder="https://..." value={f.images} onChange={set("images")} />
      </div>

      <div className="space-y-2">
        <Label>Specifications</Label>
        {specs.map((s, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="e.g. Weight" value={s.k}
              onChange={(e) => setSpecs((p) => p.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} />
            <Input placeholder="e.g. 1.2 kg" value={s.v}
              onChange={(e) => setSpecs((p) => p.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} />
            <Button type="button" variant="outline"
              onClick={() => setSpecs((p) => (p.length > 1 ? p.filter((_, j) => j !== i) : [{ k: "", v: "" }]))}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm"
          onClick={() => setSpecs((p) => [...p, { k: "", v: "" }])}>
          Add specification
        </Button>
      </div>

      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : gear ? "Save changes" : "Add gear"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/provider/gear")}>Cancel</Button>
      </div>
    </form>
  );
}