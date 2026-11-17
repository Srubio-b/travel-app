"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const displayName = fullName ?? t("userFallback");

  // Build the list of menu items dynamically so keyboard navigation matches the DOM.
  const items = useMemo(
    () => [
      { key: "profile", href: "/mi-cuenta/perfil", label: t("myAccount") },
      ...(role === "admin" ? [{ key: "admin", href: "/admin/destinos", label: t("admin") }] : []),
      { key: "logout", href: null, label: t("logout") },
    ],
    [role, t],
  );

  const focusItem = useCallback(
    (index: number) => {
      const normalized = (index + items.length) % items.length;
      setActiveIndex(normalized);
      window.setTimeout(() => itemRefs.current[normalized]?.focus(), 0);
    },
    [items.length],
  );

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        focusItem(0);
      }
      return next;
    });
  }, [focusItem]);

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

  // Global Escape closes the menu and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Unauthenticated: show login link
  if (!role) {
    return (
      <Link href="/auth/login" className="text-sm font-medium transition-colors hover:text-primary">
        {t("login")}
      </Link>
    );
  }

  function handleMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusItem(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        focusItem(0);
        break;
      case "End":
        e.preventDefault();
        focusItem(items.length - 1);
        break;
      case "Tab": {
        e.preventDefault();
        if (e.shiftKey) {
          focusItem(activeIndex - 1);
        } else {
          focusItem(activeIndex + 1);
        }
        break;
      }
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-menu"
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span>{displayName}</span>
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
        <div
          id="user-menu"
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-1 shadow-lg"
        >
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">{displayName}</div>

          <div className="border-t border-border" />

          {items.map((item, index) => {
            const refCallback = (el: HTMLAnchorElement | HTMLButtonElement | null) => {
              itemRefs.current[index] = el;
            };

            if (item.href) {
              return (
                <Link
                  key={item.key}
                  ref={refCallback as React.Ref<HTMLAnchorElement>}
                  href={item.href}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-subtle hover:text-primary"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <form
                key={item.key}
                action={async () => {
                  await logout();
                }}
              >
                <button
                  ref={refCallback as React.Ref<HTMLButtonElement>}
                  type="submit"
                  role="menuitem"
                  tabIndex={-1}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-subtle hover:text-primary"
                >
                  {item.label}
                </button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
