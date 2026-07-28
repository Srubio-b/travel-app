"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

type FilterValue = "nacional" | "internacional";

function isFilterValue(value: string): value is FilterValue {
  return value === "nacional" || value === "internacional";
}

/**
 * Pill-based filter for the catalog grid. Reflects the current `tipo` search
 * param and updates the URL on click, preserving other query params.
 * Minimal — no icons, no select dropdown.
 */
export function PackageFilter() {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTipo = searchParams.get("tipo");

  const pills: { value: string; label: string }[] = [
    { value: "", label: t("filterAll") },
    { value: "nacional", label: t("filterNational") },
    { value: "internacional", label: t("filterInternational") },
  ];

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && isFilterValue(value)) {
      params.set("tipo", value);
    } else {
      params.delete("tipo");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("filterLabel")}>
      {pills.map(({ value, label }) => {
        const isActive = value === ""
          ? !currentTipo || !isFilterValue(currentTipo)
          : currentTipo === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => handleSelect(value)}
            className={`rounded-sm border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
              isActive
                ? "border-fg bg-fg text-bg"
                : "border-border text-muted hover:border-fg hover:text-fg"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
