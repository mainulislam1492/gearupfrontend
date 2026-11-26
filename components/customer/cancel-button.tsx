"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/lib/customer-client";

export function CancelButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!confirm("Cancel this order? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      await cancelOrder(id); // the backend only allows this while the order is PLACED
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel the order");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="destructive" onClick={onClick} disabled={busy}>
        {busy ? "Cancelling..." : "Cancel order"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}