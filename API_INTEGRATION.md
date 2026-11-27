# API Integration

Maps every frontend page and component in GearUp to the backend endpoint it calls.

- **Backend:** `https://gear-up-peach.vercel.app` (Express, Prisma, PostgreSQL)
- **Frontend:** Next.js (App Router), shadcn/ui, Tailwind CSS

## How the frontend talks to the backend

| Context | How | Where |
|---|---|---|
| **Server (SSR) public data** | `fetch` to `NEXT_PUBLIC_API_URL` with caching (`revalidate`) or `no-store` | `lib/api.ts` |
| **Server (SSR) private data** | `fetch` to `BACKEND_URL/api/...`, forwarding the user's cookies, `no-store` | `lib/server-api.ts`, `lib/session.ts` |
| **Browser (CSR) mutations** | `fetch('/api/...')` with `credentials: 'include'` | `lib/http.ts` (`apiFetch`) |

**Cookie handling.** The browser calls `/api/*` on the frontend's own domain. A rewrite in `next.config.ts` forwards the call to the backend, so the access and refresh cookies are stored for the frontend's domain. That lets `proxy.ts` and server components read them.

**Silent token refresh.** `apiFetch` retries once after `POST /api/auth/refresh-token` when it gets a 401. `proxy.ts` does the same for page requests.

**Logout.** `app/session/logout/route.ts` calls `POST /api/auth/logout` and also expires the cookies on the frontend's domain.

**Environment variables**

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_API_URL` | Public server-side fetches (`.../api`) |
| `BACKEND_URL` | Rewrite target, private server fetches, `proxy.ts` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Elements (publishable key only) |

**Route protection (defence in depth).** `proxy.ts` redirects by role. Each role layout and page calls `requireUser([...])` on the server. The backend remains the final authority on roles and ownership.

---

## 1. Public (no login)

| Frontend | Rendering | Endpoint |
|---|---|---|
| `app/page.tsx` (home, categories, available gear) | SSR | `GET /api/categories` (cached 1h), `GET /api/gear` |
| `app/gear/page.tsx` (browse, search, filter, sort, paginate) | SSR | `GET /api/gear` with `searchTerm, category, brand, minPrice, maxPrice, available, sortBy, sortOrder, page, limit` |
| `components/gear-filters.tsx` | CSR | None directly. Writes filters to the URL, and the server page refetches |
| `app/gear/[id]/page.tsx` (details, reviews, rating) | SSR (60s revalidate) | `GET /api/gear/:id` |
| `app/categories/page.tsx` | SSR (1h revalidate) | `GET /api/categories` |

## 2. Authentication and profile

| Frontend | Rendering | Endpoint |
|---|---|---|
| `components/register-form.tsx` | CSR | `POST /api/users/register`, then `POST /api/auth/login` |
| `components/login-form.tsx` | CSR | `POST /api/auth/login`, then `GET /api/users/me` |
| `components/auth-provider.tsx` (header user state) | CSR | `GET /api/users/me` |
| `components/auth-buttons.tsx` (Log out) | CSR | `POST /api/auth/logout` (via `/session/logout`) |
| `lib/http.ts` (`apiFetch`) | CSR | `POST /api/auth/refresh-token` on 401 |
| `proxy.ts` | Before request | `POST /api/auth/refresh-token` when the access token is missing or expired |
| `lib/session.ts` (`getCurrentUser`, `requireUser`) | SSR | `GET /api/users/me` |
| `app/(dashboard)/profile/page.tsx` + `components/profile-form.tsx` | SSR + CSR | `GET /api/users/me`, `PUT /api/users/my-profile` |

## 3. Customer

| Frontend | Rendering | Endpoint |
|---|---|---|
| `components/rent-form.tsx` (on gear page) | CSR | `POST /api/rentals` |
| `app/(dashboard)/customer/page.tsx` (overview) | SSR | `GET /api/rentals` |
| `app/(dashboard)/customer/orders/page.tsx` (list, status filter) | SSR | `GET /api/rentals?status=` |
| `app/(dashboard)/customer/orders/[id]/page.tsx` (details, tracking) | SSR | `GET /api/rentals/:id` |
| `components/customer/cancel-button.tsx` | CSR | `PATCH /api/rentals/:id/cancel` |
| `components/customer/pay-panel.tsx` (start or retry payment) | CSR | `POST /api/payments/create` |
| `components/customer/stripe-elements.tsx`, `payment-return.tsx` | CSR | `POST /api/payments/confirm` |
| `app/(dashboard)/customer/payments/page.tsx` | SSR | `GET /api/payments` |
| `app/(dashboard)/customer/payments/[id]/page.tsx` | SSR | `GET /api/payments/:id`, `GET /api/rentals/:id` (to decide whether retry is allowed) |
| `components/customer/review-form.tsx` | CSR | `POST /api/reviews` |

## 4. Provider

| Frontend | Rendering | Endpoint |
|---|---|---|
| `app/(dashboard)/provider/page.tsx` (overview) | SSR | Own gear list (see note), `GET /api/provider/orders` |
| `app/(dashboard)/provider/gear/page.tsx` (inventory) | SSR | Own gear list (see note) |
| `components/provider/gear-form.tsx` (add) | CSR | `POST /api/provider/gear` |
| `components/provider/gear-form.tsx` (edit) + `app/.../gear/[id]/edit/page.tsx` | SSR + CSR | Own gear list (ownership check), `PUT /api/provider/gear/:id` |
| `components/provider/gear-row-actions.tsx` (stock, availability) | CSR | `PUT /api/provider/gear/:id` |
| `components/provider/gear-row-actions.tsx` (remove) | CSR | `DELETE /api/provider/gear/:id` |
| `app/(dashboard)/provider/orders/page.tsx` (list, status filter) | SSR | `GET /api/provider/orders?status=` |
| `components/provider/order-actions.tsx` (confirm, picked up, returned) | CSR | `PATCH /api/provider/orders/:id` |

> **Note: own gear list.** The API has no `GET /api/provider/gear`. `lib/provider-server.ts` currently scans `GET /api/gear` and keeps the logged-in provider's items, so hidden or unavailable gear may be missing. Adding a backend endpoint would fix this, and only `getMyGear()` needs to change.

## 5. Admin

| Frontend | Rendering | Endpoint |
|---|---|---|
| `app/(dashboard)/admin/page.tsx` (overview counts) | SSR | `GET /api/admin/users`, `GET /api/admin/gear`, `GET /api/admin/rentals` (counts) |
| `app/(dashboard)/admin/users/page.tsx` (role, status, search, paging) | SSR | `GET /api/admin/users` |
| `components/admin/user-status-button.tsx` | CSR | `PATCH /api/admin/users/:id` |
| `app/(dashboard)/admin/gear/page.tsx` (including hidden) | SSR | `GET /api/admin/gear` |
| `components/admin/gear-moderation-button.tsx` | CSR | `PATCH /api/admin/gear/:id` |
| `app/(dashboard)/admin/rentals/page.tsx` | SSR | `GET /api/admin/rentals` |
| `app/(dashboard)/admin/categories/page.tsx` | SSR | `GET /api/categories` |
| `components/admin/category-manager.tsx` | CSR | `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id` |

---

## Endpoint coverage

| Endpoint | Used |
|---|---|
| All public, auth, customer, provider and admin endpoints above | Yes |
| `POST /api/payments/stripe/webhook` | Backend only. Stripe calls it, and the frontend never does |

## Assumptions to verify

The API table gave paths and descriptions but not request bodies or sample responses. These are guesses, and each one is isolated in a single file:

| Assumption | File |
|---|---|
| Request bodies for rentals, payments, reviews and the PATCH calls | `lib/endpoints.ts` |
| Response shapes (users, gear, orders, payments) | `lib/types.ts`, `lib/user.ts` |
| Cookie names `accessToken` and `refreshToken` | `lib/constants.ts` |
| SSLCommerz uses `POST /api/payments/create` with a `method` field | `lib/endpoints.ts` (`PAYMENT_METHODS`) |
| Admin rental filters by customer and provider run in the frontend | `lib/admin-server.ts` |
