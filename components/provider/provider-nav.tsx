"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/provider", label: "Overview" },
  { href: "/provider/gear", label: "My gear" },
  { href: "/provider/orders", label: "Orders" },
  { href: "/profile", label: "Profile" },
];

export function ProviderNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b pb-3">
      {LINKS.map((l) => {
        const active = l.href === "/provider" ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-1.5 text-sm ${
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}