import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { formatCOP } from "@/lib/format/currency";
import type { PackageCardData } from "@/lib/supabase/queries";

type PackageCardProps = {
  pkg: Pick<
    PackageCardData,
    "slug" | "title" | "price" | "durationDays" | "isNational" | "primaryImage"
  >;
};

export async function PackageCard({ pkg }: PackageCardProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations("catalog"),
    getTranslations("common"),
  ]);
  const badgeLabel = pkg.isNational
    ? t("badgeNational")
    : t("badgeInternational");

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-[var(--background)] shadow-sm transition-shadow hover:shadow-md dark:border-white/10">
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
          {badgeLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold leading-tight">{pkg.title}</h3>

        <p className="text-sm text-foreground/70">
          {t("days", { count: pkg.durationDays })}
        </p>

        <p className="text-xl font-bold text-primary">
          {formatCOP(pkg.price)}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/paquetes/${pkg.slug}`}
            className="inline-flex items-center justify-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            {t("viewDetails")}
          </Link>
          <WhatsAppButton
            message={tCommon("whatsappPackageInquiry", { title: pkg.title })}
          />
        </div>
      </div>
    </article>
  );
}
