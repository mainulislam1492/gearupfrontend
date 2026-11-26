"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/lib/customer-client";

function ReviewItem({ rentalId, gearId, name }: { rentalId: string; gearId: string; name: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return setError("Choose a rating from 1 to 5.");
    setBusy(true);
    try {
      await createReview(rentalId, gearId, rating, comment.trim());
      setSaved(true);
      router.refresh();
    } catch (err) {
      // The backend rejects a second review of the same gear in the same order
      setError(err instanceof Error ? err.message : "Could not save the review");
    } finally {
      setBusy(false);
    }
  }

  if (saved) {
    return <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">Thanks, your review of {name} was saved.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-md border p-4">
      <p className="font-medium">{name}</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            className={`text-3xl leading-none ${n <= rating ? "text-amber-500" : "text-muted-foreground/40"}`}>
            &#9733;
          </button>
        ))}
      </div>
      <div className="space-y-1">
        <Label htmlFor={`c-${gearId}`}>Comment</Label>
        <Textarea id={`c-${gearId}`} rows={3} maxLength={1000} value={comment}
          onChange={(e) => setComment(e.target.value)} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Submit review"}</Button>
    </form>
  );
}

export function ReviewForm({
  rentalId, items,
}: { rentalId: string; items: { gearId?: string; name: string }[] }) {
  const reviewable = items.filter((i) => i.gearId);
  if (!reviewable.length) return <p className="text-sm text-muted-foreground">Nothing to review.</p>;
  return (
    <div className="space-y-4">
      {reviewable.map((i) => (
        <ReviewItem key={i.gearId} rentalId={rentalId} gearId={i.gearId as string} name={i.name} />
      ))}
    </div>
  );
}