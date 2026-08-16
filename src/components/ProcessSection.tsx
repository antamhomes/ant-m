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
    <section id="jak-zacina" className="section bg-gradient-dark scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "process_label")}</p>
          <h2 className="h-section-sm text-primary-foreground">{t(lang, "process_title")}</h2>
          <p className="lead lead-on-dark">{t(lang, "process_desc")}</p>
        </Reveal>

        <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-7 sm:gap-10 md:gap-8">
          {/* Desktop connector */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute left-[12.5%] right-[12.5%] top-[22px] h-px bg-gradient-to-r from-gold/20 via-gold/70 to-gold/20"
          />
          {/* Mobile track */}
          <div aria-hidden="true" className="md:hidden absolute left-[22px] top-3 bottom-3 w-px bg-primary-foreground/15" />

          {numberLabels.map((num, index) => (
            <Reveal as="li"
              key={num} delay={stagger(index, 0.08)}
              className="relative pl-16 md:pl-0 md:text-center"
            >
              {/* Number badge */}
              <div className="absolute left-0 top-0 md:static md:mx-auto md:mb-6 w-11 h-11 rounded-full bg-charcoal border border-gold/60 ring-4 ring-charcoal flex items-center justify-center">
                <span className="font-display text-base font-semibold text-gold tnum">{num}</span>
              </div>
              <h3 className="font-display text-xl md:text-[1.35rem] font-semibold text-primary-foreground mb-2 leading-snug">
                {t(lang, titleKeys[index])}
              </h3>
              <p className="font-body text-[15px] md:text-base text-primary-foreground/70 leading-relaxed md:max-w-[26ch] md:mx-auto text-pretty">
                {t(lang, descKeys[index])}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.2} className="text-center mt-10 md:mt-16">
          <a href="#kontakt" className="btn btn-primary-inverse">
            {t(lang, "process_cta")}
            <ChevronRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default ProcessSection;
