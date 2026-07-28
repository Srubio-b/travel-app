import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Logo } from "@/components/shared/Logo";

export async function Footer() {
  const [tFooter, tNav] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
  ]);

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted">{tFooter("tagline")}</p>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-col gap-3 text-sm"
          >
            <Link
              href="/paquetes?tipo=nacional"
              className="transition-colors hover:text-primary"
            >
              {tFooter("nationalTours")}
            </Link>
            <Link
              href="/paquetes?tipo=internacional"
              className="transition-colors hover:text-primary"
            >
              {tFooter("internationalTours")}
            </Link>
            <Link
              href="/destinos"
              className="transition-colors hover:text-primary"
            >
              {tNav("destinations")}
            </Link>
          </nav>

          {/* Spacer for alignment */}
          <div />
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} L&A Viajes y Aventuras.{" "}
            {tFooter("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
