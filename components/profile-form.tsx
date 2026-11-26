"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { updateProfile } from "@/lib/auth-client";
import type { User } from "@/lib/types";
import { normalizeRole } from "@/lib/user";

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const isProvider = normalizeRole(user.role) === "PROVIDER";

  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
    shopName: user.shopName ?? "",
    shopAddress: user.shopAddress ?? "",
  });
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        phone: form.phone,
        address: form.address,
      };
      if (isProvider) {
        body.shopName = form.shopName;
        body.shopAddress = form.shopAddress;
      }
      await updateProfile(body);
      await refresh(); // updates the header (client state)
      router.refresh(); // re-renders server components with fresh data
      setMessage({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{user.email}</CardTitle>
          <Badge variant="secondary">{String(user.role).toLowerCase()}</Badge>
        </div>
        <CardDescription>Your email and role cannot be changed here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={form.name} onChange={set("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={set("address")} />
          </div>

          {isProvider && (
            <>
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop name</Label>
                <Input id="shopName" value={form.shopName} onChange={set("shopName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopAddress">Shop address</Label>
                <Input id="shopAddress" value={form.shopAddress} onChange={set("shopAddress")} />
              </div>
            </>
          )}

          {message && (
            <p
              className={`rounded-md p-3 text-sm ${
                message.type === "ok" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={busy}>
            {busy ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}