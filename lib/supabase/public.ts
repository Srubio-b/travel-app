import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Anon Supabase client for server-side contexts that must stay statically
 * generatable (e.g. `sitemap.ts`, `robots.ts`). Unlike `lib/supabase/server.ts`,
 * this does NOT call `cookies()`, so it doesn't force Next.js to render the
 * route dynamically on every request. Only use this for public, anon-only
 * reads that never depend on the current user's session.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
