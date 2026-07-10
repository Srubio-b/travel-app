"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/components/shared/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("common");
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t("themeToggleLight") : t("themeToggleDark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-lg transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
