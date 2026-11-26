import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/image-gallery";
import { RatingStars } from "@/components/rating-stars";
import { averageRating, getGear } from "@/lib/api";
import { RentForm } from "@/components/rent-form";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  try {
    return await getGear(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gear = await load(id);
  return gear
    ? { title: gear.name, description: gear.description?.slice(0, 150) }
    : { title: "Gear not found" };
}

export default async function GearDetailPage({ params }: Props) {
  const { id } = await params;
  const gear = await load(id);
  if (!gear) notFound();

  const rating = averageRating(gear);
  const specs =
    gear.specifications && typeof gear.specifications === "object"
      ? Object.entries(gear.specifications)
      : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery images={gear.images ?? []} name={gear.name} />

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {gear.category && (
              <Badge variant="outline">{gear.category.name}</Badge>
            )}
            <Badge variant={gear.isAvailable ? "default" : "secondary"}>
              {gear.isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold">{gear.name}</h1>
          {gear.brand && (
            <p className="text-muted-foreground">by {gear.brand}</p>
          )}
          <RatingStars value={rating} count={gear.reviews?.length} />

          <p className="text-3xl font-bold">
            ${gear.pricePerDay}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / day
            </span>
          </p>

          {gear.description && (
            <p className="leading-relaxed">{gear.description}</p>
          )}

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Provided by</p>
            <p className="font-semibold">
              {gear.provider?.shopName ?? gear.provider?.name ?? "Rental shop"}
            </p>
          </div>

          {specs.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="mb-3 font-semibold">Specifications</h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {specs.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd>{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}

          {typeof gear.specifications === "string" && (
            <p className="text-sm">{gear.specifications}</p>
          )}

          <RentForm
            gearId={gear.id}
            pricePerDay={gear.pricePerDay}
            available={gear.isAvailable}
            stock={gear.stock}
          />
        </div>
      </div>

      <section className="mt-14">
        <h2 className="mb-6 text-2xl font-bold">
          Reviews {gear.reviews?.length ? `(${gear.reviews.length})` : ""}
        </h2>
        {gear.reviews?.length ? (
          <div className="space-y-4">
            {gear.reviews.map((r) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {r.customer?.name ?? "Customer"}
                  </p>
                  <RatingStars value={r.rating} />
                </div>
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}
