import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { formatCOP } from "@/lib/format/currency";
import type { PackageCardData } from "@/lib/supabase/queries";
import { FALLBACK_IMAGES } from "@/lib/config/images";

type PackageCardProps = {
  pkg: Pick<
    PackageCardData,
    "slug" | "title" | "price" | "durationDays" | "isNational" | "primaryImage"
  > & { id?: string };
};

export async function PackageCard({ pkg }: PackageCardProps) {
  const t = await getTranslations("catalog");

  return (
    <article className="group">
      <Link href={`/paquetes/${pkg.slug}`} className="block">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkg.primaryImage?.url ?? FALLBACK_IMAGES.card}
            alt={pkg.primaryImage?.altText ?? pkg.title}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl leading-display tracking-tight">
            <Link
              href={`/paquetes/${pkg.slug}`}
              className="transition-colors hover:text-primary"
            >
              {pkg.title}
            </Link>
          </h3>
          {pkg.isNational !== null && (
            <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted">
              {pkg.isNational ? t("badgeNational") : t("badgeInternational")}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {t("days", { count: pkg.durationDays })}
          </p>
          <p className="font-medium text-fg">{formatCOP(pkg.price)}</p>
        </div>
      </div>
    </article>
  );
}
