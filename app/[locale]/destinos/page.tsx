import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DestinationCardLink } from "@/components/destinations/DestinationCardLink";
import { createPublicClient } from "@/lib/supabase/public";
import { listDestinations } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/config/site";
import { routing } from "@/lib/i18n/routing";

export const revalidate = 300;

type DestinosPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: DestinosPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("destinations");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/destinos`,
      languages: Object.fromEntries(
        routing.locales.map((l: string) => [l, `${SITE_URL}/${l}/destinos`]),
      ),
    },
  };
}

export default async function DestinosPage() {
  const [t] = await Promise.all([getTranslations("destinations")]);

  const supabase = createPublicClient();
  const destinations = await listDestinations(supabase);

  return (
    <PublicLayout>
      <section className="container-page py-16 sm:py-24">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {t("subtitle")}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-display tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
        </header>

        {destinations.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md px-6 py-24 text-center">
            <p className="text-lg font-medium">{t("emptyTitle")}</p>
            <p className="mt-2 text-muted">{t("emptyBody")}</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <DestinationCardLink
                key={dest.slug}
                href={`/destinos/${dest.slug}`}
                name={dest.name}
                regionLine={`${dest.region ? `${dest.region}, ` : ""}${dest.country}`}
                description={dest.description}
                imageSrc={dest.imageUrl}
              />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
