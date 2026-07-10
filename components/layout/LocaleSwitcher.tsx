"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing, type Locale } from "@/lib/i18n/routing";

/**
 * Client-side locale toggle. Preserves the current pathname and query
 * params when switching locale, per spec requirement.
 */
export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    router.replace(href, { locale: nextLocale });
  }

  return (
    <label className="inline-flex items-center gap-1 text-xs uppercase text-foreground/60">
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        onChange={handleChange}
        aria-label={t("label")}
        className="min-h-[44px] rounded-md border border-transparent bg-transparent px-1 text-xs uppercase text-foreground/60 hover:border-black/10 dark:hover:border-white/10"
      >
        {routing.locales.map((availableLocale) => (
          <option key={availableLocale} value={availableLocale}>
            {t(availableLocale)}
          </option>
        ))}
      </select>
    </label>
  );
}
