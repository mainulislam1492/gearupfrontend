import { cookies } from "next/headers";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { BACKEND_URL } from "./constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function serverFetch(path: string, opts: { notFoundOnMissing?: boolean } = {}): Promise<any> {
  const store = await cookies();
  const cookie = store.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const res = await fetch(`${BACKEND_URL}/api${path}`, {
    headers: { cookie },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/login?expired=1");
  // Someone else's record and a missing record look identical to the user
  if (opts.notFoundOnMissing && (res.status === 404 || res.status === 403)) notFound();
  if (res.status === 403) redirect("/");
  if (!res.ok) throw new Error(`API ${res.status} (${path})`);
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toArray<T>(json: any): T[] {
  const d = json?.data ?? json;
  if (Array.isArray(d)) return d as T[];
  for (const k of [
    "items", "gear", "gears", "orders", "rentals", "payments",
    "users", "categories", "results", "rows", "data",
  ]) {
    if (Array.isArray(d?.[k])) return d[k] as T[];
  }
  return [];
}

// total is null when the backend sends no pagination info
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toMeta(json: any, count: number, defaultLimit: number) {
  const m = json?.meta ?? json?.data?.meta ?? json?.pagination ?? json?.data?.pagination ?? null;
  const raw = m ? (m.total ?? m.totalItems ?? m.count ?? m.totalCount) : null;
  return {
    page: Number(m?.page ?? m?.currentPage ?? 1),
    limit: Number(m?.limit ?? m?.perPage ?? defaultLimit),
    total: raw != null ? Number(raw) : (null as number | null),
    count,
  };
}

export async function safe<T>(fn: () => Promise<T>, fallback: T) {
  try {
    return { data: await fn(), error: null as string | null };
  } catch (e) {
    unstable_rethrow(e);
    return { data: fallback, error: e instanceof Error ? e.message : "Request failed" };
  }
}