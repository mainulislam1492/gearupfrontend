"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, deleteCategory, updateCategory } from "@/lib/admin-client";
import { revalidatePublicData } from "@/lib/admin-actions";
import type { Category } from "@/lib/types";

function validName(name: string) {
  const n = name.trim();
  return n.length >= 2 && n.length <= 50 ? null : "Name must be 2 to 50 characters.";
}

function CategoryRow({ c, onChanged }: { c: Category; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(c.name);
  const [description, setDescription] = useState(c.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const bad = validName(name);
    if (bad) return setError(bad);
    setBusy(true);
    setError(null);
    try {
      await updateCategory(c.id, { name: name.trim(), description: description.trim() });
      await onChanged();
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${c.name}"? A category that still has gear cannot be deleted.`)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteCategory(c.id);
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed"); // for example: category still has gear
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="space-y-2 p-4">
      {editing ? (
        <div className="flex flex-wrap gap-2">
          <Input className="w-56" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
          <Input className="min-w-64 flex-1" value={description} placeholder="Description"
            onChange={(e) => setDescription(e.target.value)} maxLength={200} />
          <Button size="sm" onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
          <Button size="sm" variant="outline" disabled={busy}
            onClick={() => { setEditing(false); setName(c.name); setDescription(c.description ?? ""); setError(null); }}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-sm text-muted-foreground">{c.description || "No description"}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={remove} disabled={busy}>Delete</Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </li>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function changed() {
    try {
      await revalidatePublicData(); // refreshes the cached public category lists
    } catch {
      /* the list still refreshes below */
    }
    router.refresh();
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const bad = validName(name);
    if (bad) return setError(bad);
    setBusy(true);
    setError(null);
    try {
      await createCategory({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      await changed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the category");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="space-y-3 rounded-lg border p-4">
        <p className="font-semibold">Add a category</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cat-desc">Description (optional)</Label>
            <Input id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />
          </div>
        </div>
        {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Adding..." : "Add category"}</Button>
      </form>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No categories yet.</div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {categories.map((c) => <CategoryRow key={c.id} c={c} onChanged={changed} />)}
        </ul>
      )}
    </div>
  );
}