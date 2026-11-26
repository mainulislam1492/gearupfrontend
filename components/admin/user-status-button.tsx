"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setUserStatus } from "@/lib/admin-client";

export function UserStatusButton({
  id, role, status, isSelf,
}: { id: string; role: string; status: string; isSelf: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The backend enforces this too; the UI just does not offer the action
  if (isSelf || role?.toUpperCase() === "ADMIN") {
    return <span className="text-xs text-muted-foreground">Protected</span>;
  }

  const suspended = status?.toUpperCase() === "SUSPENDED";

  async function toggle() {
    if (!suspended && !confirm("Suspend this user? They are blocked immediately.")) return;
    setBusy(true);
    setError(null);
    try {
      await setUserStatus(id, suspended ? "ACTIVE" : "SUSPENDED");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button size="sm" variant={suspended ? "default" : "destructive"} onClick={toggle} disabled={busy}>
        {busy ? "Saving..." : suspended ? "Activate" : "Suspend"}
      </Button>
      {error && <p className="max-w-48 text-xs text-destructive">{error}</p>}
    </div>
  );
}