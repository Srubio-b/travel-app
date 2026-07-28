import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Creates a Supabase server client using the **service_role** key.
 *
 * This client BYPASSES all Row Level Security (RLS). Use it ONLY for
 * administrative operations that need cross-user access, such as:
 *   - Admin CRUD on catalog tables (travel_packages, destinations, etc.)
 *   - Reading any user's profile or role for verification
 *   - Operations where you have already verified the caller is an admin
 *     via `requireAdmin()` or a role gate.
 *
 * NEVER expose this client to the browser. NEVER use it in Client Components.
 * NEVER use it as a shortcut to avoid writing proper RLS policies.
 *
 * The `SUPABASE_SERVICE_ROLE_KEY` environment variable MUST be set.
 * If missing, this function throws a descriptive error at runtime.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "createAdminClient: MISSING SUPABASE_SERVICE_ROLE_KEY. " +
        "Set SUPABASE_SERVICE_ROLE_KEY in your .env.local or Vercel environment variables. " +
        "You can find it in your Supabase dashboard: Project Settings → API → service_role secret.",
    );
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll: () => {
          // Admin client does NOT manage user cookies — it uses the
          // service_role key for RLS bypass. Cookie context is irrelevant.
          return [];
        },
        setAll: () => {
          // No-op — see above.
        },
      },
    },
  );
}
