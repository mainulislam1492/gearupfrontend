import { ADMIN } from "./endpoints";
import { serverFetch, toArray, toMeta } from "./server-api";
import type { AdminUser, Category, Gear, Order } from "./types";

export const ADMIN_PAGE_SIZE = 20;

function qs(o: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

// Works out the number of pages even when the backend sends no total
export function pagesOf(meta: { page: number; limit: number; total: number | null; count: number }) {
  if (meta.total != null) return Math.max(1, Math.ceil(meta.total / meta.limit));
  return meta.count >= meta.limit ? meta.page + 1 : meta.page;
}

export async function getAdminUsers(f: { role?: string; status?: string; searchTerm?: string; page: number }) {
  const json = await serverFetch(
    `${ADMIN.users}${qs({ role: f.role, status: f.status, searchTerm: f.searchTerm, page: f.page, limit: ADMIN_PAGE_SIZE })}`,
  );
  const items = toArray<AdminUser>(json);
  return { items, meta: toMeta(json, items.length, ADMIN_PAGE_SIZE) };
}

export async function getAdminGear(f: { searchTerm?: string; page: number }) {
  const json = await serverFetch(
    `${ADMIN.gear}${qs({ searchTerm: f.searchTerm, page: f.page, limit: ADMIN_PAGE_SIZE })}`,
  );
  const items = toArray<Gear>(json);
  return { items, meta: toMeta(json, items.length, ADMIN_PAGE_SIZE) };
}

export async function getAdminRentals(f: { status?: string; customer?: string; provider?: string }) {
  const json = await serverFetch(`${ADMIN.rentals}${qs({ status: f.status, limit: 200 })}`);
  let items = toArray<Order>(json);

  if (f.status) items = items.filter((o) => o.status === f.status); // safety net

  const has = (v: string | null | undefined, q: string) => !!v && v.toLowerCase().includes(q);
  const c = f.customer?.toLowerCase();
  const p = f.provider?.toLowerCase();
  if (c) items = items.filter((o) => has(o.customer?.name, c) || has(o.customer?.email, c));
  if (p) items = items.filter((o) => has(o.provider?.shopName, p) || has(o.provider?.name, p));
  return items;
}

export async function getAdminCategories() {
  return toArray<Category>(await serverFetch(ADMIN.categories));
}

// Total count for the overview cards (null if the backend sends no total)
export async function getCount(path: string, params: Record<string, string> = {}) {
  const json = await serverFetch(`${path}${qs({ ...params, page: 1, limit: 1 })}`);
  return toMeta(json, toArray(json).length, 1).total;
}