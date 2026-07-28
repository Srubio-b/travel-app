"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/i18n/navigation";
import { Link } from "@/lib/i18n/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  const links = [
    { href: "/", label: t("home") },
    { href: "/paquetes", label: t("packages") },
    { href: "/destinos", label: t("destinations") },
  ] as const;

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="relative z-50 flex h-6 w-6 flex-col items-center justify-center gap-1 sm:hidden"
      >
        <span
          className={`block h-px w-5 bg-fg transition-all duration-200 ${
            open ? "translate-y-[2.5px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-px w-5 bg-fg transition-all duration-200 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-px w-5 bg-fg transition-all duration-200 ${
            open ? "-translate-y-[2.5px] -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-sm sm:hidden"
          onClick={close}
        >
          <nav
            className="flex h-full flex-col items-center justify-center gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-2xl font-medium tracking-tight transition-colors hover:text-primary"
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4">
              <LocaleSwitcher />
              <span className="text-border">|</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
