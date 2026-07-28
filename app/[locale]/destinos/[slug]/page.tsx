import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PackageCard } from "@/components/catalog/PackageCard";
import { createClient } from "@/lib/supabase/server";
import { getDestinationBySlug } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/config/site";
import { FALLBACK_IMAGES } from "@/lib/config/images";

export const revalidate = 300;

type DestinationPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const destination = await getDestinationBySlug(supabase, slug);

  if (!destination) return {};

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
  const [t, supabase] = await Promise.all([
    getTranslations("destination"),
    createClient(),
  ]);

  const destination = await getDestinationBySlug(supabase, slug);

  if (!destination) notFound();

  return (
    <PublicLayout>
      {/* ───── Hero ───── */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={destination.imageUrl ?? FALLBACK_IMAGES.travel}
          alt={destination.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <h1 className="font-display text-5xl leading-display tracking-tight text-white sm:text-6xl lg:text-7xl">
            {destination.name}
          </h1>
          <p className="mt-2 text-lg text-white/70">
            {destination.region
              ? `${destination.region}, ${destination.country}`
              : destination.country}
          </p>
        </div>
      </section>

      {/* ───── Content ───── */}
      <section className="container-page py-16 sm:py-24">
        {destination.description && (
          <div className="mx-auto max-w-3xl">
            <p className="prose-content text-lg text-muted">
              {destination.description}
            </p>
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
  );
}
