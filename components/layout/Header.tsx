import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/shared/Logo";
import { UserMenu } from "@/components/layout/UserMenu";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm font-medium sm:flex"
        >
          <Link
            href="/"
            className="transition-colors hover:text-primary"
          >
            {t("home")}
          </Link>
          <Link
            href="/paquetes"
            className="transition-colors hover:text-primary"
          >
            {t("packages")}
          </Link>
          <Link
            href="/destinos"
            className="transition-colors hover:text-primary"
          >
            {t("destinations")}
          </Link>
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-4 sm:flex">
          <UserMenu />
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <MobileMenu />
      </div>
    </header>
  );
}
