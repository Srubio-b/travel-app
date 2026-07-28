"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { logout } from "@/app/actions/auth";

type UserMenuClientProps = {
  fullName: string | null;
  role: string | null;
  avatarUrl: string | null;
};

export function UserMenuClient({ fullName, role, avatarUrl }: UserMenuClientProps) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Unauthenticated: show login link
  if (!role) {
    return (
      <Link
        href="/auth/login"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t("login")}
      </Link>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {fullName?.charAt(0).toUpperCase() ?? "?"}
          </span>
        )}
        <span>{fullName ?? "Usuario"}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-1 shadow-lg">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
            {fullName ?? "Usuario"}
          </div>

          <div className="border-t border-border" />

          <Link
            href="/mi-cuenta/perfil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-subtle hover:text-primary"
          >
            {t("myAccount")}
          </Link>

          {role === "admin" && (
            <Link
              href="/admin/destinos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-subtle hover:text-primary"
            >
              {t("admin")}
            </Link>
          )}

          <div className="border-t border-border" />

          <form action={async () => { await logout(); }}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-subtle hover:text-primary"
            >
              {t("logout")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
