import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/utils";
import { getTranslations } from "next-intl/server";
import { TabNav, TabNavLink } from "@/components/layout/tab-nav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MiCuentaLayout({ children, params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  // Guard: redirects to login if not authenticated
  await requireAuth(supabase, locale);

  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
      </header>

      <TabNav>
        <TabNavLink href={`/${locale}/mi-cuenta/perfil`}>
          {t("trips.perfilNav")}
        </TabNavLink>
        <TabNavLink href={`/${locale}/mi-cuenta/viajes`}>
          {t("trips.nav")}
        </TabNavLink>
      </TabNav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
