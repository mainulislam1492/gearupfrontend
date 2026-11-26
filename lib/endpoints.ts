// Every backend path used by the provider area lives here
export const ENDPOINTS = {
  // ASSUMPTION: not in your table. Used to list the provider's own gear.
  myGear: "/provider/gear",

  gearCreate: "/provider/gear",
  gearUpdate: (id: string) => `/provider/gear/${id}`,
  gearUpdateMethod: "PUT",
  gearDelete: (id: string) => `/provider/gear/${id}`,

  providerOrders: "/provider/orders",
  orderStatus: (id: string) => `/provider/orders/${id}`,
  orderStatusMethod: "PATCH",
  // ASSUMPTION: the PATCH body is { status: "CONFIRMED" | "PICKED_UP" | "RETURNED" }
  orderStatusBody: (status: string) => ({ status }),
};

export const PAYMENT_METHODS = [
  { value: "STRIPE", label: "Card (Stripe)" },
  { value: "SSLCOMMERZ", label: "SSLCommerz" },
];

const enc = encodeURIComponent;

export const CUSTOMER = {
  rentals: "/rentals",
  rental: (id: string) => `/rentals/${enc(id)}`,
  cancel: (id: string) => `/rentals/${enc(id)}/cancel`,
  payments: "/payments",
  payment: (id: string) => `/payments/${enc(id)}`,
  paymentCreate: "/payments/create",
  paymentConfirm: "/payments/confirm",
  reviews: "/reviews",

  // ASSUMED request bodies: change here if your backend differs
  rentalBody: (
    gearId: string,
    quantity: number,
    startDate: string,
    endDate: string,
  ) => ({
    items: [{ gearItemId: gearId, quantity }],
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
  }),

  //paymentBody: (rentalId: string, method: string) => ({ rentalId, method }),
 paymentBody: (rentalId: string, method: string) => ({
  rentalOrderId: rentalId,
  provider: method,
}),

  confirmBody: (p: {
    paymentIntentId?: string | null;
    sessionId?: string | null;
    paymentId?: string | null;
  }) => Object.fromEntries(Object.entries(p).filter(([, v]) => v)),
  reviewBody: (
    rentalId: string,
    gearId: string,
    rating: number,
    comment: string,
  ) => ({
    rentalId,
    gearId,
    rating,
    comment,
  }),
};


export const ADMIN = {
  users: "/admin/users",
  user: (id: string) => `/admin/users/${encodeURIComponent(id)}`,
  gear: "/admin/gear",
  gearItem: (id: string) => `/admin/gear/${encodeURIComponent(id)}`,
  rentals: "/admin/rentals",
  categories: "/categories",
  category: (id: string) => `/categories/${encodeURIComponent(id)}`,

  // ASSUMED PATCH bodies: change here if your backend differs
  userStatusBody: (status: string) => ({ status }),
  gearStatusBody: (status: string) => ({ status }),
};