import { apiFetch } from "./http";
import { CUSTOMER } from "./endpoints";

export const placeOrder = (gearId: string, quantity: number, start: string, end: string) =>
  apiFetch(CUSTOMER.rentals, {
    method: "POST",
    body: JSON.stringify(CUSTOMER.rentalBody(gearId, quantity, start, end)),
  });

export const cancelOrder = (id: string) => apiFetch(CUSTOMER.cancel(id), { method: "PATCH" });

export const createPayment = (rentalId: string, method: string) =>
  apiFetch(CUSTOMER.paymentCreate, {
    method: "POST",
    body: JSON.stringify(CUSTOMER.paymentBody(rentalId, method)),
  });

export const confirmPayment = (p: {
  paymentIntentId?: string | null;
  sessionId?: string | null;
  paymentId?: string | null;
}) =>
  apiFetch(CUSTOMER.paymentConfirm, {
    method: "POST",
    body: JSON.stringify(CUSTOMER.confirmBody(p)),
  });

export const createReview = (rentalId: string, gearId: string, rating: number, comment: string) =>
  apiFetch(CUSTOMER.reviews, {
    method: "POST",
    body: JSON.stringify(CUSTOMER.reviewBody(rentalId, gearId, rating, comment)),
  });

// Pulls the new record's id out of a create response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function idFrom(res: any): string | null {
  const d = res?.data ?? res;
  return d?.id ?? d?.rental?.id ?? d?.order?.id ?? null;
}