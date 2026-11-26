import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GearForm } from "@/components/provider/gear-form";
import { getCategories } from "@/lib/api";
import { getMyGear } from "@/lib/provider-server";

export const metadata: Metadata = { title: "Edit Gear" };

export default async function EditGearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [mine, categories] = await Promise.all([getMyGear(), getCategories()]);

  // Ownership guard: only gear from the provider's own list can be opened
  const gear = mine.find((g) => g.id === id);
  if (!gear) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Edit gear</h1>
      <GearForm categories={categories} gear={gear} />
    </>
  );
}