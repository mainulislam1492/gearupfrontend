import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCategories } from "@/lib/admin-server";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireUser(["ADMIN"]);
  const categories = await getAdminCategories(); // fresh data, not the cached public list
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}