import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";

export async function Footer() {
  const [tFooter, tNav] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
  ]);

  return (
    <footer className="mt-auto border-t border-black/10 bg-[var(--background)] dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="text-sm font-medium">L&amp;A Viajes y Aventuras</p>
        <p className="text-sm text-foreground/70">{tFooter("tagline")}</p>

        <nav aria-label="Footer navigation" className="flex gap-6 text-sm">
          <Link href="/paquetes?tipo=nacional">{tFooter("nationalTours")}</Link>
          <Link href="/paquetes?tipo=internacional">
            {tFooter("internationalTours")}
          </Link>
          <Link href="/destinos">{tNav("destinations")}</Link>
        </nav>

        <p className="text-xs text-foreground/50">
          © {new Date().getFullYear()} L&amp;A Viajes y Aventuras. {tFooter("rights")}
        </p>
      </div>
    </footer>
  );
}
