import type { Metadata } from "next";
import { GearForm } from "@/components/provider/gear-form";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "Add Gear" };

export default async function NewGearPage() {
  const categories = await getCategories();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Add new gear</h1>
      <GearForm categories={categories} />
    </>
  );
}