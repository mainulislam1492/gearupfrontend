import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DebugAuth() {
  const names = (await cookies()).getAll().map((c) => c.name);
  return <pre className="p-6 text-sm">{JSON.stringify({ cookieNames: names }, null, 2)}</pre>;
}