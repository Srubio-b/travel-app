import { getTranslations } from "next-intl/server";
import type { PackageCardData } from "@/lib/supabase/queries";
import { PackageCard } from "@/components/catalog/PackageCard";

type PackageGridProps = {
  packages: PackageCardData[];
};

export async function PackageGrid({ packages }: PackageGridProps) {
  const t = await getTranslations("catalog");

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h3 className="text-lg font-medium">{t("emptyTitle")}</h3>
        <p className="max-w-md text-muted">{t("emptyBody")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.slug} pkg={pkg} />
      ))}
    </div>
  );
}
