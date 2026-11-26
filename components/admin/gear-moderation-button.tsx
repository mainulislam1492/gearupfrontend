"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setGearStatus } from "@/lib/admin-client";

export function GearModerationButton({ id, hidden }: { id: string; hidden: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!hidden && !confirm("Hide this listing from the public?")) return;
    setBusy(true);
    setError(null);
    try {
      await setGearStatus(id, hidden ? "ACTIVE" : "HIDDEN");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button size="sm" variant={hidden ? "default" : "outline"} onClick={toggle} disabled={busy}>
        {busy ? "Saving..." : hidden ? "Restore" : "Hide"}
      </Button>
      {error && <p className="max-w-48 text-xs text-destructive">{error}</p>}
    </div>
  );
}