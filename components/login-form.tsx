"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { login } from "@/lib/auth-client";
// import { dashboardPath } from "@/lib/user";
import { apiFetch } from "@/lib/http";
import { dashboardPath, unwrapUser } from "@/lib/user";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
  await login(email, password);

  const me = await apiFetch("/users/me");
  const user = unwrapUser(me);
  if (!user) {
    throw new Error("Unexpected /users/me shape: " + JSON.stringify(me).slice(0, 300));
  }

  await refresh();
  const next = params.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  router.replace(safeNext ?? dashboardPath(user.role));
  router.refresh();
} catch (err) {
  setError(err instanceof Error ? err.message : "Login failed");
} finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          {params.has("expired") ? "Your session expired. Please log in again." : "Log in to rent or manage gear."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Logging in..." : "Log in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="text-primary hover:underline">Sign up</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}