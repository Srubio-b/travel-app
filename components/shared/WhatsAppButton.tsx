import { getTranslations } from "next-intl/server";

type WhatsAppButtonProps = {
  message?: string;
  floating?: boolean;
};

/**
 * Renders a WhatsApp CTA link. When `floating` is true, it renders as a
 * fixed-position round button visible on every page. Returns null when
 * NEXT_PUBLIC_WHATSAPP_NUMBER is not configured.
 */
export async function WhatsAppButton({
  message,
  floating = false,
}: WhatsAppButtonProps) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  const t = await getTranslations("common");
  const text = encodeURIComponent(message ?? t("whatsappDefaultMessage"));
  const href = `https://wa.me/${number}?text=${text}`;

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsappCta")}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-lg transition-transform hover:scale-105"
      >
        💬
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1ebe57]"
    >
      {t("whatsappCta")}
    </a>
  );
}
