import { lazy, Suspense } from "react";
import PageShell from "@/components/PageShell";
import HeroSection from "@/components/HeroSection";
import TodayStrip from "@/components/TodayStrip";

// Below-the-fold sections are code-split so the first paint ships less JS.
const PortfolioSection = lazy(() => import("@/components/PortfolioSection"));
const CalculatorSection = lazy(() => import("@/components/CalculatorSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const ComparisonSection = lazy(() => import("@/components/ComparisonSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const FinalCtaSection = lazy(() => import("@/components/FinalCtaSection"));

/**
 * HOMEPAGE = TŘÍDIČ (2. 11. 2026, tři stránky). Jedna otázka: kdo bude byt
 * provozovat. Slib → důkaz → moje číslo → dvě cesty s cenou (tlačítka vedou
 * na /sprava a /vlastni-provoz) → srovnání s nájmem → kdo jsme → formulář.
 * Co patří jen jednomu z těch dvou lidí (provozní systém, garance v plném
 * znění, vyúčtování, služby, postup, FAQ), bydlí na jeho stránce.
 * Do 2. 11. tu stálo všechno a stránka mluvila ke dvěma lidem najednou.
 */
const Index = () => (
  <PageShell page="home">
    <HeroSection />
    <TodayStrip />
    <Suspense fallback={null}><PortfolioSection /></Suspense>
    <Suspense fallback={null}><CalculatorSection /></Suspense>
    <Suspense fallback={null}><PricingSection variant="both" /></Suspense>
    <Suspense fallback={null}><ComparisonSection /></Suspense>
    <Suspense fallback={null}><AboutSection /></Suspense>
    <Suspense fallback={null}><ContactSection /></Suspense>
    <Suspense fallback={null}><FinalCtaSection /></Suspense>
  </PageShell>
);

export default Index;
