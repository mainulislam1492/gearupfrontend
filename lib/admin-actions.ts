"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./session";
import { normalizeRole } from "./user";

export async function revalidatePublicData() {
  // Server actions are public POST endpoints, so check the caller again
  const user = await getCurrentUser();
  if (normalizeRole(user?.role) !== "ADMIN") throw new Error("Not allowed");
  revalidatePath("/", "layout");
}