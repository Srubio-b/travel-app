import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DirectionalTransition } from "@/components/shared/DirectionalTransition";
import { DestinationHero } from "@/components/destinations/DestinationHero";
import { PackageCard } from "@/components/catalog/PackageCard";
import { createClient } from "@/lib/supabase/server";
import { getDestinationBySlug } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/config/site";
import { FALLBACK_IMAGES } from "@/lib/config/images";
import { truncateWords } from "@/lib/utils/text";
import { routing } from "@/lib/i18n/routing";

export const revalidate = 300;

type DestinationPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const destination = await getDestinationBySlug(supabase, slug);

  if (!destination) return {};

  const url = `${SITE_URL}/${locale}/destinos/${slug}`;
  const description =
    truncateWords(destination.description, 25) || `${destination.name}, ${destination.country}`;

  return {
    title: `${destination.name}, ${destination.country}`,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}/destinos/${slug}`]),
      ),
    },
    openGraph: {
      title: `${destination.name}, ${destination.country}`,
      description,
      url,
      images: destination.imageUrl ? [{ url: destination.imageUrl }] : undefined,
    },
  };
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const [t, supabase] = await Promise.all([getTranslations("destination"), createClient()]);

  const destination = await getDestinationBySlug(supabase, slug);

  if (!destination) notFound();

  const regionLine = destination.region
    ? `${destination.region}, ${destination.country}`
    : destination.country;

  return (
    <DirectionalTransition>
      <PublicLayout>
        {/* ───── Hero — diorama 2.5D con morph de portada ───── */}
        <DestinationHero
          vtName={`destino-${slug}`}
          name={destination.name}
          regionLine={regionLine}
          imageSrc={destination.imageUrl ?? FALLBACK_IMAGES.travel}
          imageAlt={destination.name}
        />

        {/* ───── Content ───── */}
        <section className="container-page py-16 sm:py-24">
          {destination.description && (
            <div className="mx-auto max-w-3xl">
              <p className="prose-content text-lg text-muted">{destination.description}</p>
            </div>
          )}

          <div className="mx-auto mt-16 max-w-5xl">
            <h2 className="font-display text-3xl leading-display tracking-tight">
              {t("availablePackages")}
            </h2>

            {destination.packages.length === 0 ? (
              <div className="mt-8 px-6 py-16 text-center">
                <p className="text-muted">{t("noPackages")}</p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {destination.packages.map((pkg) => (
                  <PackageCard key={pkg.slug} pkg={pkg} />
                ))}
              </div>
            )}
          </div>
        </section>
      </PublicLayout>
    </DirectionalTransition>
  );
}
