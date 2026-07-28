"use client";

import { useState, useActionState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { register } from "@/app/actions/auth";
import type { AuthResult } from "@/lib/auth/errors";

const initialState = { success: false, error: "" } as AuthResult;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const pathname = usePathname();
  const [state, action, pending] = useActionState(register, initialState);
  const [passwordErr, setPasswordErr] = useState("");

  // Locale-aware login link: replace /register with /login in current path
  const loginHref = pathname.replace(/\/register(?:\/.*)?$/, "/login");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const password = form.password.value as string;

    if (password.length < 6) {
      setPasswordErr(t("passwordError"));
      e.preventDefault();
      return;
    }

    setPasswordErr("");
    // Let the form action handle submission
  }

  // Success but email confirmation needed
  if (state?.success && state?.message) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-green-800">{t("confirmationMessage")}</p>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <a href={loginHref} className="text-primary hover:underline">
            {t("loginLink")}
          </a>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="mb-1 block text-sm font-medium">
            {t("fullNameLabel")}
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            {t("emailLabel")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            {t("passwordLabel")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            onChange={() => setPasswordErr("")}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none"
          />
          {passwordErr && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {passwordErr}
            </p>
          )}
        </div>

        {state?.success === false && !passwordErr && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? `${t("submit")}…` : t("submit")}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <a href={loginHref} className="text-primary hover:underline">
          {t("loginLink")}
        </a>
      </p>
    </main>
  );
}
