import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "@/lib/i18n/navigation";

/**
 * Locale-aware 404 with the site's shared layout.
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <PublicLayout>
      <section className="container-page flex flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          404
        </p>
        <h1 className="font-display text-4xl leading-display tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-md text-muted">{t("body")}</p>
        <Link
          href="/"
          className="mt-2 inline-block rounded-sm border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
        >
          {t("cta")}
        </Link>
      </section>
    </PublicLayout>
  );
}
