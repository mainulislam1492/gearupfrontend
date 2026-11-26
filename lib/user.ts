import type { User } from "./types";

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

export function normalizeRole(value: unknown): Role | null {
  const v = String(value ?? "").toUpperCase();
  return v === "CUSTOMER" || v === "PROVIDER" || v === "ADMIN" ? v : null;
}

export function dashboardPath(role: unknown) {
  const r = normalizeRole(role);
  return r ? `/${r.toLowerCase()}` : "/profile";
}

// Handles { data: { profile: { ...user, profile: {...extra} } } },
// { data: { user } } and a bare user
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrapUser(json: any): User | null {
  const d = json?.data ?? json;
  const raw = d?.profile ?? d?.user ?? d;
  if (!raw || typeof raw !== "object" || !(raw.id || raw.email)) return null;

  const { profile: extra, ...rest } = raw;
  return {
    ...rest,
    phone: extra?.phone ?? null,
    address: extra?.address ?? null,
    profilePhoto: extra?.profilePhoto ?? null,
    shopName: extra?.shopName ?? null,
    shopAddress: extra?.shopAddress ?? null,
  } as User;
}