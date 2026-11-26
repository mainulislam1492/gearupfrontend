import Link from "next/link";
import { AuthButtons } from "@/components/auth-buttons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Gear<span className="text-primary">Up</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/gear" className="hover:text-primary">Browse Gear</Link>
          <Link href="/categories" className="hover:text-primary">Categories</Link>
        </nav>
        <AuthButtons />
      </div>
    </header>
  );
}