import Link from "next/link";

/**
 * Root-level fallback 404 — rendered when Next.js can't resolve a [locale]
 * segment (malformed URLs outside middleware reach).
 */
export default function RootNotFound() {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center text-fg">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          404
        </p>
        <h1 className="font-display text-4xl leading-display tracking-tight sm:text-5xl">
          Página no encontrada
        </h1>
        <p className="max-w-md text-muted">
          El contenido que buscás no existe o ya no está disponible.
        </p>
        <Link
          href="/"
          className="mt-2 inline-block rounded-sm border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Volver al inicio
        </Link>
      </body>
    </html>
  );
}
