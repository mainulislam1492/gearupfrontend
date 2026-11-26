"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/gear", label: "Gear" },
  { href: "/admin/rentals", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b pb-3">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href}
            className={`rounded-md px-3 py-1.5 text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}