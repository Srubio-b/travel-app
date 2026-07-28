import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "./profile-form";

export default async function PerfilPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const t = await getTranslations("profile");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("title")}</h2>

        {profile?.avatar_url && (
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover"
            />
          </div>
        )}

        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-muted-foreground">{t("emailLabel")}</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t("fullNameLabel")}</dt>
            <dd>{profile?.full_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t("phoneLabel")}</dt>
            <dd>{profile?.phone ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("save")}</h2>
        <ProfileForm
          defaultName={profile?.full_name ?? ""}
          defaultPhone={profile?.phone ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </section>
    </div>
  );
}
