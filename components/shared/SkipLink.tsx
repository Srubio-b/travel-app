"use client";

import { useTranslations } from "next-intl";

/**
 * Accessibility skip-to-content link. Visually hidden until focused via
 * keyboard, then jumps to the `#main-content` landmark. Must be the first
 * focusable element in the document body.
 */
export function SkipLink() {
  const t = useTranslations("common");

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      {t("skipToContent")}
    </a>
  );
}
