import { lazy, Suspense } from "react";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";

const OperatorReviewSection = lazy(() => import("@/components/OperatorReviewSection"));
const SystemSection = lazy(() => import("@/components/SystemSection"));
const TipsSection = lazy(() => import("@/components/TipsSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const ComparisonSection = lazy(() => import("@/components/ComparisonSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const FinalCtaSection = lazy(() => import("@/components/FinalCtaSection"));

/**
 * /vlastni-provoz: PROVOZUJI SÁM, pro majitele, který chce systém a marži.
 * Slib → měsíční kontrola (proof object: rozhodnutí) → co systém je (pilíře, chyby, předání) → cena → tipy z provozu (jen světlý panel,
 * přestavba jako řádek s kotvou #prestavba) → srovnání nájem / my / vy →
 * jak začít (zaškolení, 90 dní) → otázky → formulář.
 */
const VlastniProvoz = () => (
  <PageShell page="vlastni-provoz">
    <PageHero page="vlastni-provoz" />
    <Suspense fallback={null}><OperatorReviewSection /></Suspense>
    <Suspense fallback={null}><SystemSection /></Suspense>
    <Suspense fallback={null}><PricingSection variant="own" /></Suspense>
    <Suspense fallback={null}><TipsSection /></Suspense>
    <Suspense fallback={null}><ComparisonSection /></Suspense>
    <Suspense fallback={null}><ProcessSection variant="own" /></Suspense>
    <Suspense fallback={null}><FAQSection variant="own" /></Suspense>
    <Suspense fallback={null}><ContactSection /></Suspense>
    <Suspense fallback={null}><FinalCtaSection /></Suspense>
  </PageShell>
);

export default VlastniProvoz;
