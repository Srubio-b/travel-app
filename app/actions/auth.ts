"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { AuthResult } from "@/lib/auth/errors";
import { mapAuthError } from "@/lib/auth/errors";
import type { Database } from "@/lib/supabase/database.types";

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value ?? "es";
}

/* ──────────────────────────────────────────────
 * Login
 * ────────────────────────────────────────────── */

export async function login(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email y contraseña son requeridos." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: mapAuthError(error),
      field: error.message.toLowerCase().includes("email")
        ? "email"
        : "password",
    };
  }

  revalidatePath("/", "layout");

  // Read redirect param from form (set by login page via useSearchParams)
  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo) {
    redirect(redirectTo);
  }

  const locale = await getLocale();
  redirect(`/${locale}`);
}

/* ──────────────────────────────────────────────
 * Register
 * ────────────────────────────────────────────── */

export async function register(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  if (!email || !password) {
    return { success: false, error: "Email y contraseña son requeridos." };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "La contraseña debe tener al menos 6 caracteres.",
      field: "password",
    };
  }

  // Server-side full_name validation
  if (!fullName || fullName.trim().length < 2) {
    return {
      success: false,
      error: "El nombre debe tener al menos 2 caracteres.",
      field: "full_name",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: mapAuthError(error),
      field: error.message.toLowerCase().includes("email")
        ? "email"
        : "password",
    };
  }

  // Note: the DB trigger handle_new_user() atomically creates the
  // profile + user_roles row. If the trigger fails, the auth user
  // creation is rolled back — the signUp above would error.
  revalidatePath("/", "layout");

  // If Supabase requires email confirmation, there's no session yet
  if (!data.session) {
    return {
      success: true,
      message: "Revisá tu email para confirmar la cuenta.",
    };
  }

  const locale = await getLocale();
  redirect(`/${locale}`);
}

/* ──────────────────────────────────────────────
 * Logout
 * ────────────────────────────────────────────── */

export async function logout(): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: mapAuthError(error) };
  }

  revalidatePath("/", "layout");

  const locale = await getLocale();
  redirect(`/${locale}`);
}

/* ──────────────────────────────────────────────
 * Update Profile
 * ────────────────────────────────────────────── */

export async function updateProfile(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión." };
  }

  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  if (!fullName || fullName.trim().length < 2) {
    return {
      success: false,
      error: "El nombre debe tener al menos 2 caracteres.",
      field: "full_name",
    };
  }

  // Server-side phone validation
  if (phone && !/^[\d\s+\-()]{7,20}$/.test(phone.trim())) {
    return {
      success: false,
      error: "Formato de teléfono inválido.",
      field: "phone",
    };
  }

  const updates: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if (fullName) updates.full_name = fullName.trim();
  if (phone) updates.phone = phone.trim();
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/* ──────────────────────────────────────────────
 * Upload Avatar
 * ────────────────────────────────────────────── */

export async function uploadAvatar(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión." };
  }

  const file = formData.get("avatar") as File | null;
  if (!file) {
    return { success: false, error: "Seleccioná una imagen." };
  }

  // Sanity check (already checked client-side, but validate server-side too)
  if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
    return {
      success: false,
      error: "Formato no soportado. Usá PNG, JPEG, WebP o GIF.",
    };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "La imagen es muy grande. Máximo 2 MB." };
  }

  // Delete previous avatar from Storage to avoid orphan data
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (currentProfile?.avatar_url) {
    const parts = currentProfile.avatar_url.split("/avatars/");
    if (parts.length > 1) {
      const oldPath = parts[1];
      await supabase.storage.from("avatars").remove([oldPath]);
    }
  }

  const fileExt = file.name.split(".").pop() ?? "jpg";
  const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
