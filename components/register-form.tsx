"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { login, register } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/user";

// Change these if your backend expects lowercase values
const ROLE_VALUES = { customer: "CUSTOMER", provider: "PROVIDER" } as const;

export function RegisterForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [role, setRole] = useState<keyof typeof ROLE_VALUES>("customer");
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", shopName: "", shopAddress: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: ROLE_VALUES[role],
      };
      if (form.phone) body.phone = form.phone;
      if (role === "provider") {
        body.shopName = form.shopName;
        if (form.shopAddress) body.shopAddress = form.shopAddress;
      }

      await register(body);

      // Registering may not log you in, so log in right away
      try {
        await login(form.email, form.password);
        const user = await refresh();
        router.replace(dashboardPath(user?.role));
        router.refresh();
      } catch {
        router.replace("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Choose how you want to use GearUp.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={role === "customer" ? "default" : "outline"}
              onClick={() => setRole("customer")}>I want to rent gear</Button>
            <Button type="button" variant={role === "provider" ? "default" : "outline"}
              onClick={() => setRole("provider")}>I own a rental shop</Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={form.name} onChange={set("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} autoComplete="new-password"
              value={form.password} onChange={set("password")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} />
          </div>

          {role === "provider" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop name</Label>
                <Input id="shopName" required value={form.shopName} onChange={set("shopName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopAddress">Shop address</Label>
                <Input id="shopAddress" value={form.shopAddress} onChange={set("shopAddress")} />
              </div>
            </>
          )}

          {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating account..." : "Sign up"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}