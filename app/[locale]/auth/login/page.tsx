"use client";

import { useActionState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { login } from "@/app/actions/auth";
import type { AuthResult } from "@/lib/auth/errors";

const initialState = { success: false, error: "" } as AuthResult;

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const redirectParam = searchParams.get("redirect") || "";

  const [state, action, pending] = useActionState(login, initialState);

  // Locale-aware register link: replace /login with /register in current path
  const registerHref =
    pathname.replace(/\/login(?:\/.*)?$/, "/register") +
    (redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : "");

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      <form action={action} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectParam} />

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
            autoComplete="current-password"
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        {state?.success === false && (
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
        {t("noAccount")}{" "}
        <a href={registerHref} className="text-primary hover:underline">
          {t("registerLink")}
        </a>
      </p>
    </main>
  );
}
