import { Check, X } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

/**
 * Pro koho ano, pro koho ne. The old pain grid distilled into a sober,
 * two-sided qualification block: the "ne" column is the trust signal.
 * The exclusions mirror faq13 — no invented rejection rules.
 */
const YES: TranslationKey[] = ["fit_yes1", "fit_yes2", "fit_yes3", "fit_yes4", "fit_yes5"];
const NO: TranslationKey[] = ["fit_no1", "fit_no2", "fit_no3", "fit_no4"];

const FitSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="pro-koho" className="section bg-secondary scroll-mt-16">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "fit_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "fit_title")}</h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
          <Reveal className="rounded-md border border-gold/30 bg-card p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              {t(lang, "fit_yes_title")}
            </h3>
            <ul className="space-y-3 list-none m-0 p-0">
              {YES.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 mt-[0.2em] text-gold-deep shrink-0" strokeWidth={2.2} aria-hidden="true" />
                  <span className="font-body text-[15px] text-foreground/90 leading-relaxed">
                    {t(lang, key)}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="rounded-md border border-border bg-card/60 p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              {t(lang, "fit_no_title")}
            </h3>
            <ul className="space-y-3 list-none m-0 p-0">
              {NO.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <X className="w-4 h-4 mt-[0.2em] text-muted-foreground shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span className="font-body text-[15px] text-muted-foreground leading-relaxed">
                    {t(lang, key)}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 font-body text-sm text-muted-foreground text-center leading-relaxed max-w-xl mx-auto text-pretty">
            {t(lang, "fit_foot")}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default FitSection;
