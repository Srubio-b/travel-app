import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { SchemaScript } from "@/components/shared/SchemaScript";
import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPackageBySlug } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/config/site";

export const revalidate = 300;

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

type PackageDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PackageDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const pkg = await getPackageBySlug(supabase, slug);

  if (!pkg) {
    return {};
  }

  const url = `${SITE_URL}/${locale}/paquetes/${slug}`;
  const description = pkg.description.slice(0, 160);
  const primaryImage = pkg.images.find((img) => img.isPrimary) ?? pkg.images[0];

  return {
    title: pkg.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: pkg.title,
      description,
      url,
      images: primaryImage ? [{ url: primaryImage.url }] : undefined,
    },
  };
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const { slug } = await params;
  const [t, tCatalog, supabase] = await Promise.all([
    getTranslations("package"),
    getTranslations("catalog"),
    createClient(),
  ]);

  const pkg = await getPackageBySlug(supabase, slug);

  if (!pkg) {
    notFound();
  }

  const primaryImage = pkg.images.find((img) => img.isPrimary) ?? pkg.images[0];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.title,
    description: pkg.description,
    image: pkg.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: pkg.price,
      priceCurrency: "COP",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <PublicLayout>
      <SchemaScript schema={productSchema} />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface dark:bg-surface-dark">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={primaryImage.altText ?? pkg.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-5xl"
                aria-hidden="true"
              >
                🏝️
              </div>
            )}
          </div>

          {pkg.images.length > 1 ? (
            <div
              className="grid grid-cols-3 gap-2 sm:grid-cols-2"
              aria-label={t("gallery")}
            >
              {pkg.images.map((img) => (
                <div
                  key={img.url}
                  className="aspect-square overflow-hidden rounded-xl bg-surface dark:bg-surface-dark"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText ?? pkg.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">{pkg.title}</h1>
            <p className="mt-4 whitespace-pre-line text-foreground/80">
              {pkg.description}
            </p>

            {pkg.destinations.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">
                  {t("destinationsIncluded")}
                </h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {pkg.destinations.map((d) => (
                    <li key={d.slug}>
                      <Link
                        href={`/destinos/${d.slug}`}
                        className="inline-flex items-center rounded-full border border-primary px-3 py-1 text-sm text-primary transition-colors hover:bg-primary/10"
                      >
                        {d.name}, {d.country}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {pkg.whatIncludes ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">{t("includes")}</h2>
                <p className="mt-2 whitespace-pre-line text-foreground/80">
                  {pkg.whatIncludes}
                </p>
              </div>
            ) : null}

            {pkg.whatExcludes ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">{t("excludes")}</h2>
                <p className="mt-2 whitespace-pre-line text-foreground/80">
                  {pkg.whatExcludes}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {pkg.isNational
                ? tCatalog("badgeNational")
                : tCatalog("badgeInternational")}
            </span>
            <p className="text-sm text-foreground/70">
              {tCatalog("days", { count: pkg.durationDays })}
            </p>
            <p className="text-2xl font-bold text-primary">
              {COP_FORMATTER.format(pkg.price)}
            </p>
            <WhatsAppButton
              message={`¡Hola! Quiero información sobre ${pkg.title}.`}
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
