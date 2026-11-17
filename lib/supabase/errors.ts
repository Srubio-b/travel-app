import type { PostgrestError } from "@supabase/supabase-js";

export type SupabaseErrorCode =
  "unknown" | "connection" | "permission" | "not_found" | "conflict" | "validation";

/**
 * Thrown when a Supabase query fails for reasons other than "not found"
 * (network blip, RLS misconfiguration, transient DB error, etc.). Callers
 * should let this propagate to the route's error boundary instead of
 * treating it the same as a genuine 404 — a silent 404 on a real backend
 * failure is worse for SEO/monitoring than a visible error.
 */
export class SupabaseQueryError extends Error {
  public readonly code: SupabaseErrorCode;

  constructor(message: string, code: SupabaseErrorCode = "unknown", cause?: unknown) {
    super(message);
    this.name = "SupabaseQueryError";
    this.code = code;
    this.cause = cause;
  }
}

function classifyErrorCode(error: unknown): SupabaseErrorCode {
  if (!error || typeof error !== "object") return "unknown";

  const e = error as PostgrestError;
  if (e.code) {
    if (e.code.startsWith("08")) return "connection";
    if (e.code === "42501" || e.code.startsWith("PGRST")) return "permission";
    if (e.code === "23505") return "conflict";
    if (e.code === "23503") return "validation";
    if (e.code === "PGRST116") return "not_found";
  }

  return "unknown";
}

/**
 * Maps a raw Supabase / PostgREST error to a safe, localised user message.
 *
 * Never forwards the original `error.message` to the UI to avoid leaking
 * internal schema details (table names, RLS hints, etc.).
 */
export function mapSupabaseError(error: unknown, locale = "es"): string {
  const code = classifyErrorCode(error);

  const messages: Record<string, Record<SupabaseErrorCode, string>> = {
    es: {
      unknown: "Ocurrió un error inesperado. Intentalo de nuevo.",
      connection: "No pudimos conectar con el servidor. Verificá tu conexión.",
      permission: "No tenés permiso para realizar esta acción.",
      not_found: "No se encontró el recurso solicitado.",
      conflict: "Ya existe un registro con esos datos.",
      validation: "Los datos proporcionados no son válidos.",
    },
    en: {
      unknown: "An unexpected error occurred. Please try again.",
      connection: "We couldn't connect to the server. Please check your connection.",
      permission: "You don't have permission to perform this action.",
      not_found: "The requested resource was not found.",
      conflict: "A record with that data already exists.",
      validation: "The provided data is not valid.",
    },
  };

  return messages[locale]?.[code] ?? messages.es.unknown;
}

export { classifyErrorCode as classifySupabaseError };
