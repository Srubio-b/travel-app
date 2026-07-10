import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[var(--background)]/90 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-primary">
          L&amp;A Viajes y Aventuras
        </Link>

        <nav aria-label="Main navigation" className="hidden gap-6 text-sm font-medium sm:flex">
          <Link href="/">{t("home")}</Link>
          <Link href="/paquetes">{t("packages")}</Link>
          <Link href="/destinos">{t("destinations")}</Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Locale switcher: full implementation lands in PR 2 */}
          <span className="text-xs uppercase text-foreground/60" aria-hidden="true">
            ES / EN
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
