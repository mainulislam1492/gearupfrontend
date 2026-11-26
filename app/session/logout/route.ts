import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, BACKEND_URL, REFRESH_COOKIE } from "@/lib/constants";

const EPOCH = "Thu, 01 Jan 1970 00:00:00 GMT";

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ success: true, message: "Logged out by frontend" });

  // 1. Forward the backend's own clear-cookie headers (best effort)
  try {
    const backend = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    backend.headers.getSetCookie().forEach((c) => res.headers.append("set-cookie", c));
  } catch {
    /* ignore */
  }

  // 2. Expire each cookie in every common attribute combination
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    const base = `${name}=; Path=/; Max-Age=0; Expires=${EPOCH}; HttpOnly`;
    res.headers.append("set-cookie", `${base}; SameSite=Lax`);
    res.headers.append("set-cookie", `${base}; Secure; SameSite=Lax`);
    res.headers.append("set-cookie", `${base}; Secure; SameSite=None`);
  }

  return res;
}