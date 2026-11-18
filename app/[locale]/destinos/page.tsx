import Image from "next/image";
import { ViewTransition } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DirectionalTransition } from "@/components/shared/DirectionalTransition";
import { createPublicClient } from "@/lib/supabase/public";
import { FALLBACK_IMAGES } from "@/lib/config/images";
import { listDestinations } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/config/site";

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
    <DirectionalTransition>
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
                <Link
                  key={dest.slug}
                  href={`/destinos/${dest.slug}`}
                  transitionTypes={["nav-forward"]}
                  className="group block"
                >
                  <article>
                    <ViewTransition name={`destino-${dest.slug}`} share="morph" default="none">
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-surface">
                        <Image
                          src={dest.imageUrl ?? FALLBACK_IMAGES.card}
                          alt={dest.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          className="object-cover transition-all duration-500 group-hover:scale-105"
                        />
                      </div>
                    </ViewTransition>
                    <div className="mt-4 space-y-1">
                      <h2 className="font-display text-xl leading-display tracking-tight">
                        {dest.name}
                      </h2>
                      <p className="text-sm text-muted">
                        {dest.region ? `${dest.region}, ` : ""}
                        {dest.country}
                      </p>
                    </div>
                    {dest.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted/80">{dest.description}</p>
                    )}
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </PublicLayout>
    </DirectionalTransition>
  );
}
