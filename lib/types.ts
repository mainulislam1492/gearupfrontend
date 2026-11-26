export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: { name?: string } | null;
}

export interface Gear {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  pricePerDay: number;
  deposit?: number;
  stock?: number;
  images: string[];
  isAvailable: boolean;
  isHidden?: boolean;
  createdAt?: string;
  specifications?: Record<string, string> | string | null;
  categoryId?: string;
  category?: Category | null;
  provider?: { id?: string; userId?: string; shopName?: string; name?: string } | null;
  reviews?: Review[];
  averageRating?: number | null;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  meta?: Meta;
  data: T;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  phone?: string | null;
  address?: string | null;
  profilePhoto?: string | null;
  shopName?: string | null;
  shopAddress?: string | null;
  [key: string]: unknown;
}

// Add inside the existing Gear interface:
//   deposit?: number;
//   stock?: number;
//   categoryId?: string;
//   isHidden?: boolean;

export type OrderStatus =
  | "PLACED" | "CONFIRMED" | "PAID" | "PICKED_UP" | "RETURNED" | "CANCELLED";



export const ORDER_STATUSES: OrderStatus[] = [
  "PLACED", "CONFIRMED", "PAID", "PICKED_UP", "RETURNED", "CANCELLED",
];

export interface OrderItem {
  id?: string;
  gearId?: string;
  quantity?: number;
  pricePerDay?: number;
  gear?: { id?: string; name?: string; images?: string[] } | null;
}

export interface Payment {
  id: string;
  status: string;
  amount?: number;
  currency?: string;
  method?: string;
  gateway?: string;
  provider?: string;
  transactionId?: string | null;
  createdAt?: string;
  rentalId?: string;
  rental?: { id?: string; status?: string } | null;
}

export interface Order {
  id: string;
  status: OrderStatus | string;
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  totalAmount?: number;
  depositAmount?: number;
  createdAt?: string;
  customer?: { name?: string; email?: string; phone?: string | null } | null;
  provider?: { shopName?: string; name?: string } | null;
  gear?: { id?: string; name?: string } | null;
  items?: OrderItem[];
}

export const orderTotal = (o: Order) => o.totalPrice ?? o.totalAmount;
export const paymentRentalId = (p: Payment) => p.rentalId ?? p.rental?.id;

export function orderItems(o: Order) {
  const list = (o.items ?? []).map((i) => ({
    gearId: i.gearId ?? i.gear?.id,
    name: i.gear?.name ?? "Gear",
    quantity: i.quantity ?? 1,
  }));
  if (!list.length && o.gear) {
    list.push({ gearId: o.gear.id, name: o.gear.name ?? "Gear", quantity: 1 });
  }
  return list;
}

export function orderGearNames(o: Order) {
  const names = orderItems(o).map((i) => i.name);
  return names.length ? names.join(", ") : "-";
}

export interface Gear {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  pricePerDay: number;
  deposit?: number;
  stock?: number;
  images: string[];
  isAvailable: boolean;
  isHidden?: boolean;
  status?: string;
  createdAt?: string;
  specifications?: Record<string, string> | string | null;
  categoryId?: string;
  category?: Category | null;
  provider?: { id?: string; userId?: string; shopName?: string; name?: string } | null;
  reviews?: Review[];
  averageRating?: number | null;
}

export const gearHidden = (g: Gear) => g.status?.toUpperCase() === "HIDDEN" || g.isHidden === true;

export const USER_ROLES = ["CUSTOMER", "PROVIDER"] as const;
export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
  profile?: { phone?: string | null; shopName?: string | null } | null;
}