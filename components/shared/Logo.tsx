import { Link } from "@/lib/i18n/navigation";

/**
 * Minimal wordmark logo. Reemplazar con el logo real cuando esté listo.
 */
export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-0.5 font-display text-lg font-semibold leading-display tracking-tight text-fg"
    >
      L<span className="text-primary">&amp;</span>A
      <span className="self-start text-xs text-primary">.</span>
    </Link>
  );
}
