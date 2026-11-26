import { apiFetch } from "./http";
import { ADMIN } from "./endpoints";

export const setUserStatus = (id: string, status: "ACTIVE" | "SUSPENDED") =>
  apiFetch(ADMIN.user(id), { method: "PATCH", body: JSON.stringify(ADMIN.userStatusBody(status)) });

export const setGearStatus = (id: string, status: "ACTIVE" | "HIDDEN") =>
  apiFetch(ADMIN.gearItem(id), { method: "PATCH", body: JSON.stringify(ADMIN.gearStatusBody(status)) });

export const createCategory = (body: { name: string; description: string }) =>
  apiFetch(ADMIN.categories, { method: "POST", body: JSON.stringify(body) });

export const updateCategory = (id: string, body: { name: string; description: string }) =>
  apiFetch(ADMIN.category(id), { method: "PUT", body: JSON.stringify(body) });

export const deleteCategory = (id: string) => apiFetch(ADMIN.category(id), { method: "DELETE" });