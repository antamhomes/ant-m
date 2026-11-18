import { lazy, Suspense } from "react";
import PageShell from "@/components/PageShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const CalculatorSection = lazy(() => import("@/components/CalculatorSection"));
const ComparisonSection = lazy(() => import("@/components/ComparisonSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const FinalCtaSection = lazy(() => import("@/components/FinalCtaSection"));

/**
 * /kalkulacka (18. 11. 2026): kalkulačka jako vlastní stránka s vlastním
 * titulkem, aby ji šlo najít ve vyhledávání a odkázat na ni. Žádný nový
 * obsah: stejné sekce jako na homepage, jen v pořadí číslo → srovnání
 * s nájmem → cena → formulář. Nový je jen nadpis (calcpage_title).
 */
const Kalkulacka = () => {
  const { lang } = useLanguage();
  return (
    <PageShell page="kalkulacka">
      <section className="bg-gradient-dark">
        <div className="container-wide pt-32 pb-12 sm:pt-36 sm:pb-14 lg:pt-40 lg:pb-16">
          <h1 className="font-display text-[clamp(2.1rem,3.5vw,3.3rem)] font-medium leading-[1.08] tracking-[-0.018em] text-balance text-[#F7F1E8] max-w-[24ch]">
            {t(lang, "calcpage_title")}
          </h1>
        </div>
      </section>
      <Suspense fallback={null}><CalculatorSection /></Suspense>
      <Suspense fallback={null}><ComparisonSection /></Suspense>
      <Suspense fallback={null}><PricingSection variant="both" /></Suspense>
      <Suspense fallback={null}><ContactSection /></Suspense>
      <Suspense fallback={null}><FinalCtaSection /></Suspense>
    </PageShell>
  );
};

export default Kalkulacka;
