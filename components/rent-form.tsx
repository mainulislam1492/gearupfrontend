"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { idFrom, placeOrder } from "@/lib/customer-client";
import { money } from "@/lib/format";
import { normalizeRole } from "@/lib/user";

const todayLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export function RentForm({
  gearId, pricePerDay, available, stock,
}: { gearId: string; pricePerDay: number; available: boolean; stock?: number }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const today = todayLocal();
  const [quantity, setQuantity] = useState("1");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const box = "space-y-3 rounded-lg border p-4";

  if (loading) return <div className="h-40 animate-pulse rounded-lg bg-muted" />;

  if (!available) {
    return <div className={box}><p className="text-sm text-muted-foreground">This gear is currently unavailable.</p></div>;
  }

  if (!user) {
    return (
      <div className={box}>
        <p className="text-sm">Log in as a customer to rent this gear.</p>
        <Button asChild>
          <Link href={`/login?next=${encodeURIComponent(`/gear/${gearId}`)}`}>Log in to rent</Link>
        </Button>
      </div>
    );
  }

  if (normalizeRole(user.role) !== "CUSTOMER") {
    return <div className={box}><p className="text-sm text-muted-foreground">Only customer accounts can rent gear.</p></div>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) return setError("Quantity must be a whole number, 1 or more.");
    if (stock != null && qty > stock) return setError(`Only ${stock} in stock.`);
    if (!start || !end) return setError("Choose a start and end date.");
    if (start < today) return setError("Start date cannot be in the past.");
    if (end < start) return setError("End date must be on or after the start date.");
    console.log("RENT DEBUG:", { gearId, qty, start, end });
    setBusy(true);
    try {
      const res = await placeOrder(gearId, qty, start, end);
      const id = idFrom(res);
      router.push(id ? `/customer/orders/${id}` : "/customer/orders");
      router.refresh();
    } catch (err) {
      // Includes the server's "not enough stock for these dates" message
      setError(err instanceof Error ? err.message : "Could not place the order");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={box}>
      <p className="font-semibold">Rent this gear</p>
      <p className="text-sm text-muted-foreground">
        {money(pricePerDay)} per day. The total is calculated by the server when you place the order.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="start">Start date</Label>
          <Input id="start" type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="end">End date</Label>
          <Input id="end" type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="qty">Quantity</Label>
        <Input id="qty" type="number" min={1} max={stock} step={1} value={quantity}
          onChange={(e) => setQuantity(e.target.value)} required />
      </div>
      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Placing order..." : "Place rental order"}
      </Button>
    </form>
  );
}