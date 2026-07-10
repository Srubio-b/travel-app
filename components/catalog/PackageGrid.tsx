import { getTranslations } from "next-intl/server";
import { PackageCard } from "@/components/catalog/PackageCard";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import type { PackageCardData } from "@/lib/supabase/queries";

type PackageGridProps = {
  packages: PackageCardData[];
};

export async function PackageGrid({ packages }: PackageGridProps) {
  const t = await getTranslations("catalog");

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center dark:border-white/10">
        <h3 className="text-lg font-semibold">{t("emptyTitle")}</h3>
        <p className="max-w-md text-foreground/70">{t("emptyBody")}</p>
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}
