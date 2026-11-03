import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

/**
 * Kroky podle stránky (2. 11. 2026): správa končí spuštěním a provozem u nás,
 * vlastní provoz zaškolením, předáním a 60 dny. Kroky 1 a 2 jsou společné.
 */
export type ProcessVariant = "managed" | "own";
const STEPS: Record<ProcessVariant, { title: TranslationKey; desc: TranslationKey }[]> = {
  managed: [
    { title: "step1_title", desc: "step1_desc" },
    { title: "step2_title", desc: "step2_desc" },
    { title: "step3_title_managed", desc: "step3_desc_managed" },
    { title: "step4_title_managed", desc: "step4_desc_managed" },
  ],
  own: [
    { title: "step1_title", desc: "step1_desc" },
    { title: "step2_title", desc: "step2_desc" },
    { title: "step3_title_own", desc: "step3_desc_own" },
    { title: "step4_title_own", desc: "step4_desc_own" },
  ],
};

/**
 * Four steps in one row on desktop (a thin gold connector runs behind the
 * numbers), a compact vertical timeline on mobile.
 */
const ProcessSection = ({ variant = "managed" }: { variant?: ProcessVariant }) => {
  const { lang } = useLanguage();
  const steps = STEPS[variant];

  return (
    <section id="jak-zacina" className="section bg-background scroll-mt-20">
      <div className="container-wide">
        <Reveal className="section-head">
          <h2 className="h-section-sm text-foreground">{t(lang, "process_title")}</h2>
          {t(lang, "process_desc") && <p className="lead">{t(lang, "process_desc")}</p>}
        </Reveal>

        {/* 2. 11. 2026 (vizuál): čísla jako text, bez koleček a spojovací linky.
            Je to pořadí, tak je číslované; nic víc nepotřebuje. */}
        <ol className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-9 border-t border-foreground/15 pt-8">
          {steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[2.25rem_1fr] gap-x-2 sm:block">
              <span className="font-body text-sm text-muted-foreground tnum sm:block sm:mb-3">{index + 1}</span>
              <div>
                <h3 className="font-body text-[1.1rem] md:text-[1.2rem] font-medium text-foreground mb-2 leading-snug text-balance">
                  {t(lang, step.title)}
                </h3>
                <p className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed text-pretty sm:max-w-[28ch]">
                  {t(lang, step.desc)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Reveal delay={0.2} className="mt-10 md:mt-12">
          {/* Tlačítko odsud odešlo (patch 2): formulář stojí hned pod sekcí,
              tlačítko na 700 px daleký cíl bylo nadbytečné. Klíč process_cta zůstává.
              Sezónní důvod začít teď: prosincový faktor je reálně až 1,5× (SEASONS_BY_LOC),
              žádné odpočty ani umělý tlak. */}
          <p className="font-body text-[13px] text-muted-foreground max-w-md text-pretty">
            {t(lang, "process_season")}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default ProcessSection;
