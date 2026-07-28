import { getTranslations } from "next-intl/server";
import { SidebarToggle } from "./SidebarToggle";
import { AdminSidebarNav } from "./AdminSidebarNav";

type Props = {
  locale: string;
};

export async function AdminSidebar({ locale }: Props) {
  const t = await getTranslations("admin.sidebar");

  const links = [
    { href: `/${locale}/admin/destinos`, label: t("destinations") },
    { href: `/${locale}/admin/paquetes`, label: t("packages") },
    { href: `/${locale}/admin/planes`, label: t("plans") },
  ] as const;

  return (
    <SidebarToggle>
      <aside className="w-full border-b border-border md:w-56 md:border-b-0 md:border-r">
        <AdminSidebarNav links={links} />
      </aside>
    </SidebarToggle>
  );
}
