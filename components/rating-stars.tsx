export function RatingStars({ value, count }: { value: number | null; count?: number }) {
  if (value === null) return <span className="text-sm text-muted-foreground">No reviews yet</span>;
  return (
    <span className="flex items-center gap-1 text-sm">
      <span className="text-amber-500">&#9733;</span>
      <span className="font-medium">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
}