import { lazy, Suspense, useEffect, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { CalcProvider } from "@/contexts/CalcContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PageKey } from "@/lib/pages";

const Footer = lazy(() => import("@/components/Footer"));
const StickyMobileCTA = lazy(() => import("@/components/StickyMobileCTA"));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));

/** Honour a #anchor in the URL (e.g. /#kalkulacka) once its lazy section has mounted. */
const ScrollToHash = () => {
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      tries += 1;
      if (el || tries > 40) {
        window.clearInterval(timer);
        el?.scrollIntoView({ block: "start" });
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, []);
  return null;
};

/**
 * Společná kostra všech tří stránek (2. 11. 2026): skip link, navigace, SEO,
 * CalcProvider (kalkulačka i formulář ho čtou), patička, lepicí CTA a cookies.
 * Stránka dodá jen pořadí sekcí.
 */
const PageShell = ({ page, children }: { page: PageKey; children: ReactNode }) => {
  const { lang } = useLanguage();
  return (
    <div className="min-h-screen">
      <SEO page={page} />
      <a
        href="#obsah"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-sm focus:bg-primary focus:text-primary-foreground focus:font-body focus:text-sm"
      >
        {lang === "cs" ? "Přeskočit na obsah" : "Bỏ qua đến nội dung"}
      </a>
      <Navbar />
      <main id="obsah">
        <CalcProvider>
          {children}
          <ScrollToHash />
        </CalcProvider>
      </main>
      <Suspense fallback={null}><Footer /></Suspense>
      <Suspense fallback={null}><StickyMobileCTA /></Suspense>
      <Suspense fallback={null}><CookieConsent /></Suspense>
    </div>
  );
};

export default PageShell;
