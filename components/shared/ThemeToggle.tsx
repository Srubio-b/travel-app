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
      className="text-xs font-medium uppercase tracking-widest text-muted transition-colors hover:text-fg"
    >
      {isDark ? t("themeToggleLight") : t("themeToggleDark")}
    </button>
  );
}
