import { motion } from "framer-motion";
import { Eye, TrendingUp, CalendarCheck, Wallet, Check, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { reveal, revealDelayed } from "@/lib/motion";

const rows = [
  { icon: Eye, title: "comp1_title", long: "comp1_long", short: "comp1_short" },
  { icon: TrendingUp, title: "comp2_title", long: "comp2_long", short: "comp2_short" },
  { icon: CalendarCheck, title: "comp3_title", long: "comp3_long", short: "comp3_short" },
  { icon: Wallet, title: "comp4_title", long: "comp4_long", short: "comp4_short" },
] as const;

/**
 * Long-term vs. antam homes as a real side-by-side comparison. The antam
 * column is tinted so the eye lands on it first; on mobile the two columns
 * stack inside each row so nothing is hidden behind an accordion.
 */
const WhyBetterSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="section bg-background">
      <div className="container-narrow">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "whyBetter_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "whyBetter_title1")}
            <span className="text-gradient-gold">{t(lang, "whyBetter_title2")}</span>
            {t(lang, "whyBetter_title3")}
          </h2>
          <p className="lead">{t(lang, "whyBetter_desc")}</p>
        </motion.div>

        <motion.div {...revealDelayed(0.1)} className="rounded-md border border-border overflow-hidden bg-card">
          {/* Header — desktop only */}
          <div className="hidden md:grid grid-cols-[1.1fr_1fr_1.2fr] border-b border-border">
            <div className="px-6 py-4" />
            <div className="px-6 py-4 font-body text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {t(lang, "longTerm_label")}
            </div>
            <div className="px-6 py-4 font-body text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-deep bg-gold/[0.07] border-l border-gold/20">
              {t(lang, "shortTerm_label")}
            </div>
          </div>

          <ul className="divide-y divide-border">
            {rows.map(({ icon: Icon, title, long, short }) => (
              <li key={title} className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_1.2fr]">
                <div className="px-6 pt-5 pb-2 md:py-6 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gold shrink-0" strokeWidth={1.6} />
                  <h3 className="font-display text-lg md:text-xl font-semibold text-foreground leading-snug">
                    {t(lang, title)}
                  </h3>
                </div>
                <div className="px-6 pb-4 md:py-6 flex gap-3">
                  <Minus className="w-4 h-4 mt-1 text-muted-foreground/60 shrink-0" />
                  <div>
                    <span className="md:hidden block font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground mb-1">
                      {t(lang, "longTerm_label")}
                    </span>
                    <p className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed text-pretty">
                      {t(lang, long)}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 md:py-6 flex gap-3 bg-gold/[0.07] md:border-l border-gold/20">
                  <Check className="w-4 h-4 mt-1 text-gold-deep shrink-0" strokeWidth={2.2} />
                  <div>
                    <span className="md:hidden block font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep mb-1">
                      {t(lang, "shortTerm_label")}
                    </span>
                    <p className="font-body text-[15px] md:text-base text-foreground leading-relaxed text-pretty">
                      {t(lang, short)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyBetterSection;
