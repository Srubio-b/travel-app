import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { SkipLink } from "@/components/shared/SkipLink";

export async function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton floating />
    </div>
  );
}
