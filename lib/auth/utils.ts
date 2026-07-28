import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type UserRoleInfo = {
  role: string | null;
  user: import("@supabase/supabase-js").User | null;
};

/**
 * Reads the authenticated user's role from `user_roles` joined with `roles`.
 *
 * Wrapped in `React.cache()` so it's deduplicated within a single render
 * pass — safe to call multiple times in the same Server Component tree
 * without extra queries.
 */
export const getUserRole = cache(
  async (
    supabase: SupabaseClient<Database>,
  ): Promise<UserRoleInfo> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { role: null, user: null };

    const { data } = await supabase
      .from("user_roles")
      .select("role_id, roles!inner(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    return { role: data?.roles?.name ?? null, user };
  },
);

/**
 * Guards a Server Component or Server Action: ensures the caller is
 * authenticated. If not, redirects to the login page.
 *
 * Returns the user object when authenticated.
 */
export async function requireAuth(
  supabase: SupabaseClient<Database>,
  locale = "es",
) {
  const { user } = await getUserRole(supabase);
  if (!user) redirect(`/${locale}/auth/login`);
  return user;
}

/**
 * Guards a Server Component or Server Action: ensures the caller has the
 * `admin` role. If not authenticated, redirects to login. If authenticated
 * but not admin, redirects home.
 *
 * Returns the user and role info when authorized.
 */
export async function requireAdmin(
  supabase: SupabaseClient<Database>,
  locale = "es",
) {
  const { role, user } = await getUserRole(supabase);

  if (!user) redirect(`/${locale}/auth/login`);
  if (role !== "admin") redirect(`/${locale}`);

  return { user, role };
}
