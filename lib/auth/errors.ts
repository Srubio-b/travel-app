import type { ActionResult } from "@/types";

/**
 * Auth operation result — a specialisation of `ActionResult` that can carry
 * a confirmation message on success (e.g. email verification pending).
 *
 * `field` is optional on errors and hints the form which input to highlight.
 */
export type AuthResult = ActionResult<{ message?: string }>;

/**
 * Maps raw Supabase auth error messages to user-safe, localised strings.
 *
 * Prevents leaking internal details (e.g. "User already registered" tells
 * an attacker that the email exists in the system). Keep the mapping
 * generic enough to not reveal which field is wrong for login.
 */
export function mapAuthError(error: { message: string }): string {
  const m = error.message.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirmá tu email antes de iniciar sesión. Revisá tu bandeja de entrada.";
  }
  if (m.includes("user already registered")) {
    return "Ya hay una cuenta con este email.";
  }
  if (m.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (m.includes("rate limit")) {
    return "Demasiados intentos. Esperá unos minutos e intentá de nuevo.";
  }

  // Fallback — generic, safe message for unhandled errors
  return "Ocurrió un error al autenticar. Intentalo de nuevo.";
}
