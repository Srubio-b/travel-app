import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PackageGrid } from "@/components/catalog/PackageGrid";
import { PackageFilter } from "@/components/catalog/PackageFilter";
import { createClient } from "@/lib/supabase/server";
import { listPackages, type ListPackagesOptions } from "@/lib/supabase/queries";

export const revalidate = 300;

type PaquetesPageProps = {
  searchParams: Promise<{ tipo?: string }>;
};

function toTipoFilter(value: string | undefined): ListPackagesOptions["tipo"] {
  if (value === "nacional" || value === "internacional") return value;
  return undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("catalog");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function PaquetesPage({
  searchParams,
}: PaquetesPageProps) {
  const [{ tipo }, t] = await Promise.all([
    searchParams,
    getTranslations("catalog"),
  ]);

  const supabase = await createClient();
  const packages = await listPackages(supabase, { tipo: toTipoFilter(tipo) });

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-2 text-foreground/70">{t("subtitle")}</p>
          </div>
          <PackageFilter />
        </header>

        <PackageGrid packages={packages} />
      </section>
    </PublicLayout>
  );
}
