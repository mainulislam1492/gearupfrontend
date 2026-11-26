"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/customer", label: "Overview" },
  { href: "/customer/orders", label: "My orders" },
  { href: "/customer/payments", label: "Payments" },
  { href: "/profile", label: "Profile" },
];

export function CustomerNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b pb-3">
      {LINKS.map((l) => {
        const active = l.href === "/customer" ? pathname === l.href : pathname.startsWith(l.href);
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