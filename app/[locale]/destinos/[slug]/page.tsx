import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { PackageCard } from "@/components/catalog/PackageCard";
import { createClient } from "@/lib/supabase/server";
import { getDestinationBySlug } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/config/site";

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
  const [t, supabase] = await Promise.all([
    getTranslations("destination"),
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
              <PackageCard key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
