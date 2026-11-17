import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/utils";
import { mapSupabaseError, SupabaseQueryError } from "@/lib/supabase/errors";
import { logQueryError } from "@/lib/logger";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value ?? "es";
}

export type AdminActionContext = {
  locale: string;
  user: User;
  adminClient: SupabaseClientWithDatabase;
};

type SupabaseClientWithDatabase = ReturnType<typeof createAdminClient>;

/**
 * Wraps an admin-only Server Action with authentication, locale injection,
 * admin client creation, and consistent error mapping.
 *
 * Redirect errors from Next.js are re-thrown so that `redirect()` keeps working.
 * Infrastructure errors (SupabaseQueryError or generic Error) are mapped to a
 * safe ActionResult-like failure shape instead of leaking raw messages.
 */
export function withAdminAction<T>(
  action: (ctx: AdminActionContext, formData: FormData) => Promise<T>,
): (_prev: T | null, formData: FormData) => Promise<T> {
  return async (_prev, formData) => {
    const userClient = await createClient();
    const locale = await getLocale();
    const { user } = await requireAdmin(userClient, locale);
    const adminClient = createAdminClient();

    try {
      return await action({ locale, user, adminClient }, formData);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      logQueryError("withAdminAction", error);

      if (error instanceof SupabaseQueryError || error instanceof Error) {
        return {
          success: false,
          error: mapSupabaseError(error, locale),
        } as unknown as T;
      }

      throw error;
    }
  };
}
