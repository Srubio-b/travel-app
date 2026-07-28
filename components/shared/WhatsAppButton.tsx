import { getTranslations } from "next-intl/server";

type WhatsAppButtonProps = {
  message?: string;
  floating?: boolean;
};

/**
 * Renders a WhatsApp CTA link. When `floating` is true, renders as a
 * fixed-position link on every page. Returns a disabled fallback when
 * NEXT_PUBLIC_WHATSAPP_NUMBER is not configured.
 * No icons or emojis — minimal text-only approach.
 */
export async function WhatsAppButton({
  message,
  floating = false,
}: WhatsAppButtonProps) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const t = await getTranslations("common");

  if (!number) {
    if (floating) return null;

    return (
      <span className="inline-block rounded-sm border border-border px-5 py-2.5 text-sm text-muted">
        {t("contactUs")}
      </span>
    );
  }

  const text = encodeURIComponent(message ?? t("whatsappDefaultMessage"));
  const href = `https://wa.me/${number}?text=${text}`;

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 rounded-sm bg-primary px-5 py-3 text-xs font-medium uppercase tracking-widest text-white shadow-lg transition-all hover:bg-primary/90"
      >
        {t("whatsappCta")}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-sm border border-primary px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
    >
      {t("whatsappCta")}
    </a>
  );
}
