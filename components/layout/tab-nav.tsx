"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabNav({ children }: { children: React.ReactNode }) {
  return (
    <nav className="-mb-[1px] flex gap-0 border-b" aria-label="Tabs">
      {children}
    </nav>
  );
}

export function TabNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "border-b-2 border-foreground text-foreground"
          : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
