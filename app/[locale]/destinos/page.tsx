import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { createPublicClient } from "@/lib/supabase/public";
import { listDestinations } from "@/lib/supabase/queries";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("destinations");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function DestinosPage() {
  const [t] = await Promise.all([
    getTranslations("destinations"),
  ]);

  const supabase = createPublicClient();
  const destinations = await listDestinations(supabase);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-foreground/70">{t("subtitle")}</p>
        </header>

        {destinations.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-black/10 p-12 text-center dark:border-white/10">
            <p className="text-lg font-medium">{t("emptyTitle")}</p>
            <p className="text-sm text-foreground/70">{t("emptyBody")}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinos/${dest.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-[var(--background)] shadow-sm transition-shadow hover:shadow-md dark:border-white/10"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface dark:bg-surface-dark">
                  {dest.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-4xl"
                      aria-hidden="true"
                    >
                      🌍
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="text-lg font-semibold leading-tight">
                    {dest.name}
                  </h3>
                  <p className="text-sm text-foreground/70">
                    {dest.region ? `${dest.region}, ` : ""}
                    {dest.country}
                  </p>
                  {dest.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/60">
                      {dest.description}
                    </p>
                  )}
                  <span className="mt-auto pt-3 text-sm font-medium text-primary">
                    {t("viewDestinations")} &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
