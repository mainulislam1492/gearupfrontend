"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">We could not load the data. Please try again.</p>
      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 rounded-md bg-muted p-3 font-mono text-xs">{error.message}</p>
      )}
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  );
}