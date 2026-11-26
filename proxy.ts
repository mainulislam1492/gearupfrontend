import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, BACKEND_URL, REFRESH_COOKIE } from "@/lib/constants";
import { dashboardPath, normalizeRole } from "@/lib/user";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decode(token?: string): any {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function alive(payload: any) {
  return !!payload && (typeof payload.exp !== "number" || payload.exp * 1000 > Date.now() + 10_000);
}

async function tryRefresh(refreshToken: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: `${REFRESH_COOKIE}=${refreshToken}` },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;

    const setCookies = res.headers.getSetCookie();
    const pairs = new Map<string, string>();
    for (const sc of setCookies) {
      const [pair] = sc.split(";");
      const i = pair.indexOf("=");
      if (i > 0) pairs.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
    return { setCookies, pairs };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let access = decode(request.cookies.get(ACCESS_COOKIE)?.value);
  let newCookies: string[] = [];
  const requestHeaders = new Headers(request.headers);

  // Access token missing or expired, but a refresh token exists: renew it
  const isAuthPage = pathname === "/login" || pathname === "/register";

// Access token missing or expired, but a refresh token exists: renew it
if (!isAuthPage && !alive(access) && refresh) {
  const result = await tryRefresh(refresh);
  if (result) {
    newCookies = result.setCookies;
    const merged = new Map(request.cookies.getAll().map((c) => [c.name, c.value]));
    result.pairs.forEach((v, k) => merged.set(k, v));
    // Lets server components in this same request see the new token
    requestHeaders.set("cookie", [...merged].map(([k, v]) => `${k}=${v}`).join("; "));
    access = decode(result.pairs.get(ACCESS_COOKIE));
  }
}

  const loggedIn = alive(access);
  const role = normalizeRole(access?.role);
  const finish = (res: NextResponse) => {
    newCookies.forEach((c) => res.headers.append("set-cookie", c));
    return res;
  };
  const next = () => finish(NextResponse.next({ request: { headers: requestHeaders } }));

  // /login and /register: send logged-in users to their dashboard.
  // "expired" prevents a redirect loop when the cookie is valid but /me fails.
  if (pathname === "/login" || pathname === "/register") {
    if (loggedIn && !searchParams.has("expired")) {
      return finish(NextResponse.redirect(new URL(dashboardPath(role), request.url)));
    }
    return next();
  }

  // Protected routes
  if (!loggedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role guard (first line of defense; the backend still enforces roles)
  const section = ["customer", "provider", "admin"].find(
    (s) => pathname === `/${s}` || pathname.startsWith(`/${s}/`),
  );
  if (section && role && role !== section.toUpperCase()) {
    return finish(NextResponse.redirect(new URL(dashboardPath(role), request.url)));
  }

  return next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/profile/:path*",
    "/customer/:path*",
    "/provider/:path*",
    "/admin/:path*",
  ],
};