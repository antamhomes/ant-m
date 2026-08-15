import { lazy, Suspense, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import PortfolioSection from "@/components/PortfolioSection";
import { useLanguage } from "@/contexts/LanguageContext";

// Below-the-fold sections are code-split so the first paint ships less JS.
const CalculatorSection = lazy(() => import("@/components/CalculatorSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const WhyBetterSection = lazy(() => import("@/components/WhyBetterSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const OwnerReportSection = lazy(() => import("@/components/OwnerReportSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));
const StickyMobileCTA = lazy(() => import("@/components/StickyMobileCTA"));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));

/** Once the lazy sections are on the page, honour a #anchor in the URL (e.g. /#kalkulacka). */
const ScrollToHash = () => {
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: "start" });
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
        <BenefitsSection />
        <PortfolioSection />
        <Suspense fallback={null}>
          <CalculatorSection />
          <ServicesSection />
          <WhyBetterSection />
          <ProcessSection />
          <OwnerReportSection />
          <FAQSection />
          <ContactSection />
          <ScrollToHash />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <StickyMobileCTA />
        <CookieConsent />
      </Suspense>
    </div>
  );
};

export default Index;
