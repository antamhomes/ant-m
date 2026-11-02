import { lazy, Suspense } from "react";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import TodayStrip from "@/components/TodayStrip";

const PortfolioSection = lazy(() => import("@/components/PortfolioSection"));
const CalculatorSection = lazy(() => import("@/components/CalculatorSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const OwnerReportSection = lazy(() => import("@/components/OwnerReportSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const FinalCtaSection = lazy(() => import("@/components/FinalCtaSection"));

/**
 * /sprava: PROVOZUJEME ZA VÁS, pro majitele, který chce výnos a ne práci.
 * Slib → důkaz → moje číslo → co se děje bez vás → vyúčtování → cena
 * (jen tmavý panel, garance a krytí škod v řádcích) → jak začít → otázky → formulář.
 */
const Sprava = () => (
  <PageShell page="sprava">
    <PageHero page="sprava" />
    <TodayStrip />
    <Suspense fallback={null}><PortfolioSection /></Suspense>
    <Suspense fallback={null}><CalculatorSection /></Suspense>
    <Suspense fallback={null}><ServicesSection /></Suspense>
    <Suspense fallback={null}><OwnerReportSection /></Suspense>
    <Suspense fallback={null}><PricingSection variant="managed" /></Suspense>
    <Suspense fallback={null}><ProcessSection variant="managed" /></Suspense>
    <Suspense fallback={null}><FAQSection variant="managed" /></Suspense>
    <Suspense fallback={null}><ContactSection /></Suspense>
    <Suspense fallback={null}><FinalCtaSection /></Suspense>
  </PageShell>
);

export default Sprava;
