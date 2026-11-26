const STEPS = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP", "RETURNED"];

export function OrderTracker({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">This order was cancelled.</p>;
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-2 text-center text-xs">
      {STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s} className="space-y-1">
            <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <p className={done ? "font-medium" : "text-muted-foreground"}>{s.replace("_", " ")}</p>
          </li>
        );
      })}
    </ol>
  );
}