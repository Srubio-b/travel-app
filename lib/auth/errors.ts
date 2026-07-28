/**
 * Typed auth operation results.
 *
 * Every Server Action returns an `AuthResult` so the caller can reliably
 * distinguish success from failure without inspecting thrown exceptions.
 *
 * `field` is optional — when present, it hints the form which input to
 * highlight. The string value corresponds to a `FormData` key name.
 * `message` is optional on success — used when the action didn't fully
 * complete (e.g. email confirmation required) but is not an error.
 */
export type AuthResult =
  | { success: true; message?: string }
  | { success: false; error: string; field?: string };

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
