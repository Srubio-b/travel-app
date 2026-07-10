import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "@/lib/i18n/navigation";

/**
 * Locale-aware 404, styled with the site's shared layout. Rendered when
 * `notFound()` is called from any page within `app/[locale]/*`
 * (e.g. unknown package or destination slug).
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <PublicLayout>
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-foreground/70">{t("body")}</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {t("cta")}
        </Link>
      </section>
    </PublicLayout>
  );
}
