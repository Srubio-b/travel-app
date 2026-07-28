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
      <section className="container-page py-16 sm:py-24">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {t("subtitle")}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-display tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
          </div>
          <PackageFilter />
        </header>

        <div className="mt-12">
          <PackageGrid packages={packages} />
        </div>
      </section>
    </PublicLayout>
  );
}
