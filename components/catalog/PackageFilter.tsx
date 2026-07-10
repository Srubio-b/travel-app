"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

type TipoFilter = "nacional" | "internacional";

function isTipoFilter(value: string): value is TipoFilter {
  return value === "nacional" || value === "internacional";
}

/**
 * Client-side `<select>` filter for the catalog grid. Reflects the current
 * `tipo` search param and updates the URL on change, preserving other
 * query params and the current locale-aware pathname.
 */
export function PackageFilter() {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTipo = searchParams.get("tipo");

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value && isTipoFilter(value)) {
      params.set("tipo", value);
    } else {
      params.delete("tipo");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="package-filter" className="text-sm font-medium">
        {t("filterLabel")}
      </label>
      <select
        id="package-filter"
        name="tipo"
        value={currentTipo && isTipoFilter(currentTipo) ? currentTipo : ""}
        onChange={handleChange}
        className="min-h-[44px] rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 text-sm dark:border-white/10"
      >
        <option value="">{t("filterAll")}</option>
        <option value="nacional">{t("filterNational")}</option>
        <option value="internacional">{t("filterInternational")}</option>
      </select>
    </div>
  );
}
