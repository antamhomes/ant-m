import { ChevronRight } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const numberLabels = ["01", "02", "03", "04"];
const titleKeys = ["step1_title", "step2_title", "step3_title", "step4_title"] as const;
const descKeys = ["step1_desc", "step2_desc", "step3_desc", "step4_desc"] as const;

/**
 * Four steps in one row on desktop (a thin gold connector runs behind the
 * numbers), a compact vertical timeline on mobile.
 */
const ProcessSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="jak-zacina" className="section bg-secondary scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "process_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "process_title")}</h2>
          {t(lang, "process_desc") && <p className="lead">{t(lang, "process_desc")}</p>}
        </Reveal>

        <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-7 sm:gap-10 md:gap-8">
          {/* Desktop connector */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute left-[12.5%] right-[12.5%] top-[22px] h-px bg-gradient-to-r from-gold/20 via-gold/70 to-gold/20"
          />
          {/* Mobile track */}
          <div aria-hidden="true" className="md:hidden absolute left-[22px] top-3 bottom-3 w-px bg-border" />

          {numberLabels.map((num, index) => (
            <Reveal as="li"
              key={num} delay={stagger(index, 0.08)}
              className="relative pl-16 md:pl-0 md:text-center"
            >
              {/* Number badge */}
              <div className="absolute left-0 top-0 md:static md:mx-auto md:mb-6 w-11 h-11 rounded-full bg-card border border-gold/60 ring-4 ring-secondary flex items-center justify-center">
                <span className="font-display text-base font-semibold text-gold-deep tnum">{num}</span>
              </div>
              <h3 className="font-display text-xl md:text-[1.35rem] font-semibold text-foreground mb-2 leading-snug">
                {t(lang, titleKeys[index])}
              </h3>
              <p className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed md:max-w-[26ch] md:mx-auto text-pretty">
                {t(lang, descKeys[index])}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.2} className="text-center mt-10 md:mt-16">
          <a href="#kontakt" className="btn btn-primary">
            {t(lang, "process_cta")}
            <ChevronRight className="w-4 h-4" />
          </a>
          {/* Sezónní důvod začít teď: prosincový faktor je reálně až 1,5× (SEASONS_BY_LOC),
              žádné odpočty ani umělý tlak. */}
          <p className="font-body text-[13px] text-muted-foreground mt-4 max-w-md mx-auto text-pretty">
            {t(lang, "process_season")}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default ProcessSection;
