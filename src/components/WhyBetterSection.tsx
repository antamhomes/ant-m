import { Eye, TrendingUp, CalendarCheck, Wallet, Check, Minus } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const rows = [
  { icon: Eye, title: "comp1_title", long: "comp1_long", short: "comp1_short" },
  { icon: TrendingUp, title: "comp2_title", long: "comp2_long", short: "comp2_short" },
  { icon: CalendarCheck, title: "comp3_title", long: "comp3_long", short: "comp3_short" },
  { icon: Wallet, title: "comp4_title", long: "comp4_long", short: "comp4_short" },
] as const;

/**
 * Long-term vs. Antam Homes as a real side-by-side comparison. The antam
 * column is tinted so the eye lands on it first; on mobile the two columns
 * stack inside each row so nothing is hidden behind an accordion.
 */
const WhyBetterSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="section bg-background">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "whyBetter_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "whyBetter_title1")}
            <span className="text-gradient-gold">{t(lang, "whyBetter_title2")}</span>
            {t(lang, "whyBetter_title3")}
          </h2>
          <p className="lead">{t(lang, "whyBetter_desc")}</p>
        </Reveal>

        <Reveal delay={0.1} className="rounded-md border border-border overflow-hidden bg-card">
          {/* Header — desktop only */}
          <div className="grid grid-cols-2 md:grid-cols-[1.1fr_1fr_1.2fr] border-b border-border">
            <div className="hidden md:block px-6 py-4" />
            <div className="px-4 md:px-6 py-3 md:py-4 font-body text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] md:tracking-[0.28em] text-muted-foreground">
              {t(lang, "longTerm_label")}
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 font-body text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] md:tracking-[0.28em] text-gold-deep bg-gold/[0.07] border-l border-gold/20">
              {t(lang, "shortTerm_label")}
            </div>
          </div>

          <ul className="divide-y divide-border">
            {rows.map(({ icon: Icon, title, long, short }) => (
              <li key={title} className="grid grid-cols-2 md:grid-cols-[1.1fr_1fr_1.2fr]">
                <div className="px-3 md:px-6 pt-4 pb-1.5 md:py-6 flex items-center gap-2 md:gap-3">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-gold shrink-0" strokeWidth={1.6} />
                  <h3 className="font-display text-[15px] md:text-xl font-semibold text-foreground leading-snug whitespace-nowrap">
                    {t(lang, title)}
                  </h3>
                </div>
                <div className="col-start-1 md:col-start-auto px-3 md:px-6 pb-4 md:py-6 flex items-start gap-2 md:gap-3">
                  <Minus className="hidden md:block w-4 h-4 mt-1 text-muted-foreground/60 shrink-0" />
                  <div>
                    <p className="font-body text-[13px] md:text-base text-muted-foreground leading-normal md:leading-relaxed text-pretty">
                      {t(lang, long)}
                    </p>
                  </div>
                </div>
                {/* Phones: spans the title row too, so the vertical rule is continuous and the text sits mid-row. */}
                <div className="col-start-2 row-start-1 row-span-2 md:col-start-auto md:row-start-auto md:row-span-1 px-3 md:px-6 py-3 md:py-6 flex items-center md:items-start gap-1.5 md:gap-3 md:bg-gold/[0.07] border-l border-gold/20">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mt-[3px] md:mt-1 text-gold-deep shrink-0" strokeWidth={2.2} />
                  <div>
                    <p className="font-body text-[13px] md:text-base text-foreground leading-normal md:leading-relaxed text-pretty">
                      {t(lang, short)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
};

export default WhyBetterSection;
