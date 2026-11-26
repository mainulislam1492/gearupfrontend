import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RatingStars } from "@/components/rating-stars";
import { averageRating } from "@/lib/api";
import type { Gear } from "@/lib/types";

export function GearCard({ gear }: { gear: Gear }) {
  const image = gear.images?.[0];
  return (
    <Link href={`/gear/${gear.id}`} className="group">
      <Card className="h-full overflow-hidden pt-0 transition hover:shadow-lg">
        <div className="relative aspect-[4/3] bg-muted">
          {image ? (
            <Image
              src={image}
              alt={gear.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          <Badge
            className="absolute left-3 top-3"
            variant={gear.isAvailable ? "default" : "secondary"}
          >
            {gear.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>
        <CardContent className="space-y-1">
          <p className="text-xs uppercase text-muted-foreground">
            {gear.category?.name ?? "Gear"}
            {gear.brand ? ` • ${gear.brand}` : ""}
          </p>
          <h3 className="line-clamp-1 font-semibold">{gear.name}</h3>
          <RatingStars value={averageRating(gear)} count={gear.reviews?.length} />
        </CardContent>
        <CardFooter className="mt-auto flex items-baseline justify-between">
          <span className="text-lg font-bold">
            ${gear.pricePerDay}
            <span className="text-sm font-normal text-muted-foreground"> / day</span>
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {gear.provider?.shopName ?? gear.provider?.name}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}