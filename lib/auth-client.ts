import { apiFetch } from "./http";
import { unwrapUser } from "./user";

export async function fetchMe() {
  return unwrapUser(await apiFetch("/users/me"));
}

export const login = (email: string, password: string) =>
  apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const register = (body: Record<string, unknown>) =>
  apiFetch("/users/register", { method: "POST", body: JSON.stringify(body) });

export const logout = () =>
  fetch("/session/logout", { method: "POST", credentials: "include" });

export const updateProfile = (body: Record<string, unknown>) =>
  apiFetch("/users/my-profile", { method: "PUT", body: JSON.stringify(body) });