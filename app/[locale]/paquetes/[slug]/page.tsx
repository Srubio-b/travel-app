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
import { formatCOP } from "@/lib/format/currency";
import { FALLBACK_IMAGES } from "@/lib/config/images";

export const revalidate = 300;

type PackageDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PackageDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const pkg = await getPackageBySlug(supabase, slug);

  if (!pkg) return {};

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

  if (!pkg) notFound();

  const primaryImage = pkg.images.find((img) => img.isPrimary) ?? pkg.images[0];
  const otherImages = pkg.images.filter(
    (img) => img.url !== primaryImage?.url,
  );

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

      {/* ───── Hero image ───── */}
      <section className="container-page pt-8 sm:pt-12">
        <div className="aspect-[16/9] w-full overflow-hidden rounded-sm bg-surface sm:aspect-[21/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryImage?.url ?? FALLBACK_IMAGES.destinationHero}
            alt={primaryImage?.altText ?? pkg.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Gallery */}
        {otherImages.length > 0 && (
          <div
            className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5"
            aria-label={t("gallery")}
          >
            {otherImages.map((img) => (
              <div
                key={img.url}
                className="aspect-square overflow-hidden rounded-sm bg-surface"
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
        )}
      </section>

      {/* ───── Content ───── */}
      <section className="container-page py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 lg:pr-8">
            <h1 className="font-display text-4xl leading-display tracking-tight sm:text-5xl">
              {pkg.title}
            </h1>

            <div className="mt-8 space-y-8">
              <p className="prose-content text-muted">{pkg.description}</p>

              {pkg.whatIncludes && (
                <section>
                  <h2 className="text-sm font-medium uppercase tracking-widest text-fg">
                    {t("includes")}
                  </h2>
                  <p className="prose-content mt-3 text-muted">
                    {pkg.whatIncludes}
                  </p>
                </section>
              )}

              {pkg.whatExcludes && (
                <section>
                  <h2 className="text-sm font-medium uppercase tracking-widest text-fg">
                    {t("excludes")}
                  </h2>
                  <p className="prose-content mt-3 text-muted">
                    {pkg.whatExcludes}
                  </p>
                </section>
              )}

              {pkg.destinations.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium uppercase tracking-widest text-fg">
                    {t("destinationsIncluded")}
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {pkg.destinations.map((d) => (
                      <li key={d.slug}>
                        <Link
                          href={`/destinos/${d.slug}`}
                          className="inline-block rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-fg hover:text-fg"
                        >
                          {d.name}, {d.country}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-6 rounded-sm border border-border p-6">
              <div className="space-y-3">
                <span className="inline-block rounded-sm bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                  {pkg.isNational
                    ? tCatalog("badgeNational")
                    : tCatalog("badgeInternational")}
                </span>
                <p className="text-sm text-muted">
                  {tCatalog("days", { count: pkg.durationDays })}
                </p>
              </div>

              <p className="font-display text-3xl leading-display tracking-tight">
                {formatCOP(pkg.price)}
              </p>

              <WhatsAppButton
                message={`¡Hola! Quiero información sobre ${pkg.title}.`}
              />
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
