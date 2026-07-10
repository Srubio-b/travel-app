import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDestinationBySlug } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/config/site";

export const revalidate = 300;

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

type DestinationPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const destination = await getDestinationBySlug(supabase, slug);

  if (!destination) {
    return {};
  }

  const url = `${SITE_URL}/${locale}/destinos/${slug}`;
  const description =
    destination.description?.slice(0, 160) ??
    `${destination.name}, ${destination.country}`;

  return {
    title: `${destination.name}, ${destination.country}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${destination.name}, ${destination.country}`,
      description,
      url,
      images: destination.imageUrl ? [{ url: destination.imageUrl }] : undefined,
    },
  };
}

export default async function DestinationPage({
  params,
}: DestinationPageProps) {
  const { slug } = await params;
  const [t, tCatalog, supabase] = await Promise.all([
    getTranslations("destination"),
    getTranslations("catalog"),
    createClient(),
  ]);

  const destination = await getDestinationBySlug(supabase, slug);

  if (!destination) {
    notFound();
  }

  return (
    <PublicLayout>
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-surface dark:bg-surface-dark">
        {destination.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : null}
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {destination.name}
          </h1>
          <p className="mt-2 text-lg text-foreground/80">
            {destination.region
              ? `${destination.region}, ${destination.country}`
              : destination.country}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {destination.description ? (
          <p className="text-foreground/80">{destination.description}</p>
        ) : null}

        <h2 className="mt-10 text-2xl font-semibold">
          {t("availablePackages")}
        </h2>

        {destination.packages.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center dark:border-white/10">
            <p className="max-w-md text-foreground/70">{t("noPackages")}</p>
            <WhatsAppButton />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destination.packages.map((pkg) => (
              <article
                key={pkg.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-[var(--background)] shadow-sm transition-shadow hover:shadow-md dark:border-white/10"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface dark:bg-surface-dark">
                  {pkg.primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pkg.primaryImage.url}
                      alt={pkg.primaryImage.altText ?? pkg.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-4xl"
                      aria-hidden="true"
                    >
                      🏝️
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    {pkg.isNational
                      ? tCatalog("badgeNational")
                      : tCatalog("badgeInternational")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-lg font-semibold leading-tight">
                    {pkg.title}
                  </h3>
                  <p className="text-sm text-foreground/70">
                    {tCatalog("days", { count: pkg.durationDays })}
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {COP_FORMATTER.format(pkg.price)}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href={`/paquetes/${pkg.slug}`}
                      className="inline-flex items-center justify-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      {tCatalog("viewDetails")}
                    </Link>
                    <WhatsAppButton
                      message={`¡Hola! Quiero información sobre ${pkg.title}.`}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
