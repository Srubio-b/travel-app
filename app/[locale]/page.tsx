import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { createClient } from "@/lib/supabase/server";
import { listPackages } from "@/lib/supabase/queries";
import { Link } from "@/lib/i18n/navigation";
import { FALLBACK_IMAGES } from "@/lib/config/images";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { PackageCardData } from "@/lib/supabase/queries";

async function getFeaturedPackages(supabase: SupabaseClient<Database>): Promise<PackageCardData[]> {
  try {
    return await listPackages(supabase, { limit: 3 });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const supabase = await createClient();
  const [t, tCatalog, featuredPackages] = await Promise.all([
    getTranslations("home"),
    getTranslations("catalog"),
    getFeaturedPackages(supabase),
  ]);

  return (
    <PublicLayout>
      {/* ───── Hero ───── */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
        {/* Fallback background image — reemplazar con foto real del destino destacado */}
        <Image
          src={FALLBACK_IMAGES.hero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-display text-balance text-5xl leading-display tracking-tight sm:text-6xl lg:text-7xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted sm:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="mt-10">
            <Link
              href="/paquetes"
              className="inline-block rounded-sm border border-primary px-8 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {t("heroCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Featured packages ───── */}
      {featuredPackages.length > 0 && (
        <section className="container-page pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl leading-display tracking-tight sm:text-4xl">
              {t("featuredTitle")}
            </h2>
            <p className="mt-4 text-muted">{t("featuredSubtitle")}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((pkg) => (
              <Link key={pkg.id} href={`/paquetes/${pkg.slug}`} className="group block">
                <article>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-surface">
                    <Image
                      src={pkg.primaryImage?.url ?? FALLBACK_IMAGES.card}
                      alt={pkg.primaryImage?.altText ?? pkg.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="font-display text-xl leading-display tracking-tight">
                      {pkg.title}
                    </h3>
                    <p className="text-sm text-muted">
                      {tCatalog("days", { count: pkg.durationDays })}
                      {pkg.isNational !== null &&
                        ` · ${tCatalog(pkg.isNational ? "badgeNational" : "badgeInternational")}`}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ───── About ───── */}
      <section className="border-t border-border">
        <div className="container-page py-24">
          <div className="mx-auto grid max-w-4xl gap-12 sm:grid-cols-2 sm:gap-16">
            <div>
              <h2 className="font-display text-3xl leading-display tracking-tight sm:text-4xl">
                {t("agencyTitle")}
              </h2>
            </div>
            <div className="space-y-4">
              <p className="prose-content text-muted">{t("agencyBody")}</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
