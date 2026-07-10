import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { ThemeProvider, themeAntiFlashScript } from "@/components/shared/ThemeProvider";
import { SchemaScript } from "@/components/shared/SchemaScript";
import { SITE_URL } from "@/lib/config/site";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "L&A Viajes y Aventuras",
    template: "%s | L&A Viajes y Aventuras",
  },
  description:
    "Planes turísticos nacionales e internacionales con atención personalizada.",
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": ["TravelAgency", "LocalBusiness"],
  name: "L&A Viajes y Aventuras",
  description:
    "Agencia de turismo especializada en planes nacionales e internacionales.",
  url: SITE_URL,
  areaServed: "CO",
  priceRange: "$$",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeAntiFlashScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SchemaScript schema={businessSchema} />
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
