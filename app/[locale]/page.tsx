import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";

async function getFeaturedPackage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("travel_packages")
    .select("title, slug, package_images(url, alt_text, is_primary)")
    .eq("is_active", true)
    .not("published_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch featured package:", error);
  }

  if (!data) return null;

  const images = (data.package_images ?? []) as {
    url: string;
    alt_text: string | null;
    is_primary: boolean;
  }[];
  const primary = images.find((img) => img.is_primary) ?? images[0] ?? null;

  const imageUrl = primary
    ? supabase.storage.from("package-images").getPublicUrl(primary.url).data
        .publicUrl
    : null;

  return {
    title: data.title as string,
    slug: data.slug as string,
    imageUrl,
    imageAlt: primary?.alt_text ?? (data.title as string),
  };
}

export default async function HomePage() {
  const [t, featured] = await Promise.all([
    getTranslations("home"),
    getFeaturedPackage(),
  ]);

  return (
    <PublicLayout>
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-surface dark:bg-surface-dark">
        {featured?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featured.imageUrl}
            alt={featured.imageAlt}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : null}
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 text-lg text-foreground/80">{t("heroSubtitle")}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/paquetes"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("heroCta")}
            </Link>
            <WhatsAppButton />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold">{t("agencyTitle")}</h2>
        <p className="mt-4 text-foreground/80">{t("agencyBody")}</p>
      </section>
    </PublicLayout>
  );
}
