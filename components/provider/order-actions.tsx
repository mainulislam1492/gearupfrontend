"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/provider-client";

// Only the transitions a provider is allowed to make
const NEXT: Record<string, { to: string; label: string }> = {
  PLACED: { to: "CONFIRMED", label: "Confirm order" },
  PAID: { to: "PICKED_UP", label: "Mark picked up" },
  PICKED_UP: { to: "RETURNED", label: "Mark returned" },
};

export function OrderActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const action = NEXT[status];

  if (!action) {
    return (
      <span className="text-xs text-muted-foreground">
        {status === "CONFIRMED" ? "Waiting for customer payment" : "No action"}
      </span>
    );
  }

  async function onClick() {
    setBusy(true);
    setError(null);
    try {
      await updateOrderStatus(id, action.to);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button size="sm" onClick={onClick} disabled={busy}>
        {busy ? "Updating..." : action.label}
      </Button>
      {error && <p className="max-w-48 text-xs text-destructive">{error}</p>}
    </div>
  );
}