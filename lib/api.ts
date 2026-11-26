import type { Category, Gear, Meta } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL!;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest", sortBy: "createdAt", sortOrder: "desc" },
  { value: "oldest", label: "Oldest", sortBy: "createdAt", sortOrder: "asc" },
  { value: "price_asc", label: "Price: Low to High", sortBy: "pricePerDay", sortOrder: "asc" },
  { value: "price_desc", label: "Price: High to Low", sortBy: "pricePerDay", sortOrder: "desc" },
  { value: "name_asc", label: "Name: A to Z", sortBy: "name", sortOrder: "asc" },
  { value: "name_desc", label: "Name: Z to A", sortBy: "name", sortOrder: "desc" },
] as const;

// Filters as they appear in the frontend URL
export interface GearQuery {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  available?: string; // "true" | "false"
  sort?: string;
  page?: string;
  limit?: string;
}

export const PAGE_LIMIT = 12;

/* ---------- helpers that tolerate different response shapes ---------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

async function request(path: string, init?: RequestInit & { next?: { revalidate?: number } }) {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText} (${path})`);
  return (await res.json()) as Json;
}

function pickArray<T>(payload: Json, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    for (const k of keys) {
      if (Array.isArray(payload[k])) return payload[k] as T[];
    }
  }
  return [];
}

function pickMeta(json: Json, fallbackCount: number): Meta {
  const m = json?.meta ?? json?.data?.meta ?? json?.pagination ?? json?.data?.pagination ?? {};
  return {
    page: Number(m.page ?? m.currentPage ?? 1),
    limit: Number(m.limit ?? m.perPage ?? PAGE_LIMIT),
    total: Number(m.total ?? m.totalItems ?? m.count ?? m.totalCount ?? fallbackCount),
  };
}

/* ---------- query mapping ---------- */

function toQuery(f: GearQuery) {
  const sort = SORT_OPTIONS.find((s) => s.value === f.sort) ?? SORT_OPTIONS[0];
  const p = new URLSearchParams();
  if (f.q) p.set("searchTerm", f.q);
  if (f.category) p.set("category", f.category);
  if (f.brand) p.set("brand", f.brand);
  if (f.minPrice) p.set("minPrice", f.minPrice);
  if (f.maxPrice) p.set("maxPrice", f.maxPrice);
  if (f.available) p.set("available", f.available);
  p.set("sortBy", sort.sortBy);
  p.set("sortOrder", sort.sortOrder);
  p.set("page", f.page ?? "1");
  p.set("limit", f.limit ?? String(PAGE_LIMIT));
  return p.toString();
}

/* ---------- public API ---------- */

const LIST_KEYS = ["data", "items", "gear", "gears", "results", "rows"];

export async function getGearList(filters: GearQuery = {}) {
  const json = await request(`/gear?${toQuery(filters)}`, { cache: "no-store" });
  const items = pickArray<Gear>(json?.data ?? json, LIST_KEYS);
  return { items, meta: pickMeta(json, items.length) };
}

export async function getGear(id: string) {
  const json = await request(`/gear/${id}`, { next: { revalidate: 60 } });
  const d = json?.data ?? json;
  return (d?.gear ?? d) as Gear;
}

export async function getCategories() {
  const json = await request("/categories", { next: { revalidate: 3600 } });
  console.log("CATEGORIES RAW:", JSON.stringify(json).slice(0, 500)); // temporary debug line
  return pickArray<Category>(json?.data ?? json, ["categories", "data", "items", "results"]);
}

export function averageRating(gear: Gear) {
  if (typeof gear.averageRating === "number") return gear.averageRating;
  if (!gear.reviews?.length) return null;
  return gear.reviews.reduce((s, r) => s + r.rating, 0) / gear.reviews.length;
}