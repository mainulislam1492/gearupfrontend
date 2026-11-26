"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteGear, updateGear } from "@/lib/provider-client";

export function GearRowActions({
  id, stock, isAvailable,
}: { id: string; stock: number; isAvailable: boolean }) {
  const router = useRouter();
  const [qty, setQty] = useState(String(stock));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>, okText?: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = (await fn()) as { message?: string } | null;
      setMsg(okText ?? res?.message ?? "Done");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  const qtyValid = qty !== "" && Number.isInteger(Number(qty)) && Number(qty) >= 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input type="number" min={0} className="w-20" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Button size="sm" variant="secondary" disabled={busy || !qtyValid || Number(qty) === stock}
          onClick={() => run(() => updateGear(id, { stock: Number(qty) }), "Stock updated")}>
          Save stock
        </Button>
        <Button size="sm" variant="outline" disabled={busy}
          onClick={() => run(() => updateGear(id, { isAvailable: !isAvailable }), "Availability updated")}>
          {isAvailable ? "Mark unavailable" : "Mark available"}
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/provider/gear/${id}/edit`}>Edit</Link>
        </Button>
        <Button size="sm" variant="destructive" disabled={busy}
          onClick={() => {
            if (confirm("Remove this gear? If it has rental history it will be hidden instead of deleted.")) {
              run(() => deleteGear(id));
            }
          }}>
          Remove
        </Button>
      </div>
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}