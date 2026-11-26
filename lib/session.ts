import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BACKEND_URL } from "./constants";
import type { User } from "./types";
import { dashboardPath, normalizeRole, unwrapUser, type Role } from "./user";

// Cached per request, so layout and page share one backend call
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const cookieHeader = store.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/users/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return unwrapUser(await res.json());
  } catch {
    return null;
  }
});

export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?expired=1");

  const role = normalizeRole(user.role);
  if (roles && (!role || !roles.includes(role))) redirect(dashboardPath(role));
  return user;
}