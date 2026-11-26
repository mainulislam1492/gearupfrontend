"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { dashboardPath } from "@/lib/user";

export function AuthButtons() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild><Link href="/login">Log in</Link></Button>
        <Button asChild><Link href="/register">Sign up</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button variant="ghost" asChild>
        <Link href={dashboardPath(user.role)}>Dashboard</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/profile" className="max-w-28 truncate">{user.name}</Link>
      </Button>
      <Button
  variant="outline"
  onClick={async () => {
    await signOut();
    window.location.href = "/"; // full reload clears all client state
  }}
>
  Log out
</Button>
    </div>
  );
}