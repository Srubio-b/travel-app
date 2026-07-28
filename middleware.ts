import createI18nMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";

const i18nMiddleware = createI18nMiddleware(routing);

export async function middleware(request: NextRequest) {
  // ---------------------------------------------------------------
  // Step 1: i18n — let next-intl handle locale detection & redirect
  // ---------------------------------------------------------------
  const i18nResponse = i18nMiddleware(request);
  if (i18nResponse) return i18nResponse;

  // ---------------------------------------------------------------
  // Step 2: Auth — check session & protect routes
  // ---------------------------------------------------------------
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const locale = request.nextUrl.locale || routing.defaultLocale;

  // Protected: /[locale]/admin/* → must be authenticated (role check delegated to layout)
  if (path === `/${locale}/admin` || path.startsWith(`/${locale}/admin/`)) {
    if (!user) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protected: /[locale]/mi-cuenta/* → must be authenticated
  if (
    path === `/${locale}/mi-cuenta` ||
    path.startsWith(`/${locale}/mi-cuenta/`)
  ) {
    if (!user) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login / register
  if (
    path === `/${locale}/auth/login` ||
    path.startsWith(`/${locale}/auth/login/`) ||
    path === `/${locale}/auth/register` ||
    path.startsWith(`/${locale}/auth/register/`)
  ) {
    if (user) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
