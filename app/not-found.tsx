import Link from "next/link";

/**
 * Root-level fallback 404. Rendered only when Next.js cannot resolve a
 * `[locale]` segment (e.g. malformed URLs outside the middleware's reach).
 * Locale-aware 404s for valid routes are handled by
 * `app/[locale]/not-found.tsx`. No root layout wraps this route, so it
 * renders its own minimal `<html>`/`<body>`.
 */
export default function RootNotFound() {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-neutral-900">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg">Página no encontrada.</p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Volver al inicio
        </Link>
      </body>
    </html>
  );
}
