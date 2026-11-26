import type { Metadata } from "next";
import { ProfileForm } from "../../../components/profile-form";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">My Profile</h1>
      <ProfileForm user={user} />
    </>
  );
}