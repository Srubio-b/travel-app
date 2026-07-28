import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/utils";
import { getTranslations } from "next-intl/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  // Guard: redirects to login if not authenticated, or home if not admin
  await requireAdmin(supabase, locale);

  const t = await getTranslations("admin");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col md:flex-row">
      <AdminSidebar locale={locale} />
      <main className="flex-1 px-4 py-8">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
