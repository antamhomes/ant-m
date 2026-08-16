import { lazy, Suspense, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import ForYouSection from "@/components/ForYouSection";
import { useLanguage } from "@/contexts/LanguageContext";

// Below-the-fold sections are code-split so the first paint ships less JS.
const WhyBetterSection = lazy(() => import("@/components/WhyBetterSection"));
const PriceStrip = lazy(() => import("@/components/PriceStrip"));
const CalculatorSection = lazy(() => import("@/components/CalculatorSection"));
const PortfolioSection = lazy(() => import("@/components/PortfolioSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const OwnerReportSection = lazy(() => import("@/components/OwnerReportSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
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

const Index = () => {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen">
      <SEO page="home" />
      <a
        href="#obsah"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-sm focus:bg-primary focus:text-primary-foreground focus:font-body focus:text-sm"
      >
        {lang === "cs" ? "Přeskočit na obsah" : "Bỏ qua đến nội dung"}
      </a>
      <Navbar />
      <main id="obsah">
        <HeroSection />
        <ForYouSection />
        {/* Each section has its own boundary, so a slow chunk never holds the others back. */}
        <Suspense fallback={null}><WhyBetterSection /></Suspense>
        <Suspense fallback={null}><PriceStrip /></Suspense>
        <Suspense fallback={null}><CalculatorSection /></Suspense>
        <Suspense fallback={null}><PortfolioSection /></Suspense>
        <Suspense fallback={null}><ServicesSection /></Suspense>
        <Suspense fallback={null}><OwnerReportSection /></Suspense>
        <Suspense fallback={null}><ProcessSection /></Suspense>
        <Suspense fallback={null}><AboutSection /></Suspense>
        <Suspense fallback={null}><FAQSection /></Suspense>
        <Suspense fallback={null}><ContactSection /></Suspense>
        <ScrollToHash />
      </main>
      <Suspense fallback={null}><Footer /></Suspense>
      <Suspense fallback={null}><StickyMobileCTA /></Suspense>
      <Suspense fallback={null}><CookieConsent /></Suspense>
    </div>
  );
};

export default Index;
