"use client";

import { Link, usePathname } from "@/lib/i18n/navigation";

export type NavLink = {
  href: string;
  label: string;
};

type Props = {
  links: readonly NavLink[];
};

/**
 * Client component that renders admin sidebar navigation links with
 * active-page highlighting via `aria-current="page"`.
 *
 * Extracted into a separate Client Component so it can call `usePathname()`
 * while `AdminSidebar` stays a Server Component for i18n data fetching.
 */
export function AdminSidebarNav({ links }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 p-2 md:flex-col md:gap-0 md:p-4">
      {links.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-subtle hover:text-primary ${
              isActive
                ? "bg-primary-subtle text-primary"
                : "text-fg"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
