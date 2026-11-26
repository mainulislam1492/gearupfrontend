import { apiFetch } from "./http";
import { ENDPOINTS } from "./endpoints";

export const createGear = (body: Record<string, unknown>) =>
  apiFetch(ENDPOINTS.gearCreate, { method: "POST", body: JSON.stringify(body) });

export const updateGear = (id: string, body: Record<string, unknown>) =>
  apiFetch(ENDPOINTS.gearUpdate(id), {
    method: ENDPOINTS.gearUpdateMethod,
    body: JSON.stringify(body),
  });

export const deleteGear = (id: string) =>
  apiFetch(ENDPOINTS.gearDelete(id), { method: "DELETE" });

export const updateOrderStatus = (id: string, status: string) =>
  apiFetch(ENDPOINTS.orderStatus(id), {
    method: ENDPOINTS.orderStatusMethod,
    body: JSON.stringify(ENDPOINTS.orderStatusBody(status)),
  });