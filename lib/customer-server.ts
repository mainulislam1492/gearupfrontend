import { CUSTOMER } from "./endpoints";
import { serverFetch, toArray } from "./server-api";
import type { Order, Payment } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unwrapOrder = (json: any) => {
  const d = json?.data ?? json;
  return (d?.rental ?? d?.order ?? d) as Order;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unwrapPayment = (json: any) => {
  const d = json?.data ?? json;
  return (d?.payment ?? d) as Payment;
};

export async function getMyOrders(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const orders = toArray<Order>(await serverFetch(`${CUSTOMER.rentals}${qs}`));
  return status ? orders.filter((o) => o.status === status) : orders;
}

export async function getOrder(id: string) {
  return unwrapOrder(await serverFetch(CUSTOMER.rental(id), { notFoundOnMissing: true }));
}

// Same as getOrder, but throws an error instead of showing a 404 page
export async function getOrderSoft(id: string) {
  return unwrapOrder(await serverFetch(CUSTOMER.rental(id)));
}

export async function getMyPayments() {
  return toArray<Payment>(await serverFetch(CUSTOMER.payments));
}

export async function getPayment(id: string) {
  return unwrapPayment(await serverFetch(CUSTOMER.payment(id), { notFoundOnMissing: true }));
}