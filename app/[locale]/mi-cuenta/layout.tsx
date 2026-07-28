import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/utils";
import { getTranslations } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MiCuentaLayout({ children, params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  // Guard: redirects to login if not authenticated
  await requireAuth(supabase, locale);

  const t = await getTranslations("profile");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </header>
      {children}
    </div>
  );
}
