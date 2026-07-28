"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing, type Locale } from "@/lib/i18n/routing";

/**
 * Minimal locale toggle using text links instead of a <select>.
 * Preserves the current pathname and query params when switching locale.
 */
export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(nextLocale: Locale) {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: nextLocale });
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wider">
      {routing.locales.map((l, i) => (
        <span key={l}>
          {i > 0 && <span className="text-border">/</span>}
          <button
            type="button"
            onClick={() => handleChange(l as Locale)}
            aria-label={t("label")}
            className={`transition-colors hover:text-fg ${
              locale === l ? "text-fg" : "text-muted"
            }`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </span>
  );
}
