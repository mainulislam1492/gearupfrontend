export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parse(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function messageFrom(json: any, fallback: string) {
  return (
    json?.message ||
    json?.error?.message ||
    (typeof json?.error === "string" ? json.error : null) ||
    fallback
  );
}

// Browser-side fetch. Goes through the /api rewrite, sends cookies,
// and retries once after refreshing the access token on a 401.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch<T = any>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    const refreshed = await fetch("/api/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) return apiFetch<T>(path, init, false);
  }

  const json = await parse(res);
  if (!res.ok) throw new ApiError(messageFrom(json, res.statusText), res.status);
  return json as T;
}