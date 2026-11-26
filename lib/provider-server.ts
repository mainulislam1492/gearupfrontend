import { unstable_rethrow } from "next/navigation";
import { getGearList } from "./api";
import { ENDPOINTS } from "./endpoints";
import { serverFetch, toArray } from "./server-api";
import { getCurrentUser } from "./session";
import type { Gear, Order } from "./types";
import type { User } from "./types";

// Does this gear belong to the logged-in provider?
function isMine(g: Gear, user: User) {
  const p = g.provider;
  if (!p) return false;
  if (p.id === user.id || p.userId === user.id) return true;
  // Fallback only when the API gives no ids on the provider object
  if (!p.id && !p.userId && user.shopName && p.shopName) return p.shopName === user.shopName;
  return false;
}

// STOPGAP: there is no "list my gear" endpoint, so scan the public list and keep own gear.
// Limits: gear the public list hides (hidden or unavailable items) may not appear.
export async function getMyGear() {
  const user = await getCurrentUser();
  if (!user) return [];

  const mine: Gear[] = [];
  const MAX_PAGES = 20;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { items, meta } = await getGearList({ page: String(page), limit: "50" });
    mine.push(...items.filter((g) => isMine(g, user)));
    if (page * meta.limit >= meta.total || items.length === 0) break;
  }
  return mine;
}

export async function getProviderOrders(status?: string) {
  const qs = status ? `?status=${status}` : "";
  const orders = toArray<Order>(await serverFetch(`${ENDPOINTS.providerOrders}${qs}`));
  // Safety net in case the backend ignores the status filter
  return status ? orders.filter((o) => o.status === status) : orders;
}

// Runs a loader, keeps redirects working, and returns the error text instead of crashing
export async function safe<T>(fn: () => Promise<T>, fallback: T) {
  try {
    return { data: await fn(), error: null as string | null };
  } catch (e) {
    unstable_rethrow(e); // lets redirect() from a 401 or 403 still happen
    return { data: fallback, error: e instanceof Error ? e.message : "Request failed" };
  }
}