import { motion } from "framer-motion";
import { Eye, TrendingUp, CalendarCheck, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const compIcons = [Eye, TrendingUp, CalendarCheck, Wallet];
const compTitleKeys = ["comp1_title", "comp2_title", "comp3_title", "comp4_title"] as const;
const compLongKeys = ["comp1_long", "comp2_long", "comp3_long", "comp4_long"] as const;
const compShortKeys = ["comp1_short", "comp2_short", "comp3_short", "comp4_short"] as const;

const WhyBetterSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <p className="eyebrow eyebrow-center mb-5">
            {t(lang, "whyBetter_label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
            {t(lang, "whyBetter_title1")}
            <span className="text-gradient-gold">{t(lang, "whyBetter_title2")}</span>
            {t(lang, "whyBetter_title3")}
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t(lang, "whyBetter_desc")}
          </p>
        </motion.div>

        {/* Editorial comparison: hairline rows, big number, two text columns */}
        <div className="border-t border-border/70">
          {compIcons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="grid grid-cols-12 gap-x-6 gap-y-5 py-8 md:py-10 border-b border-border/70"
            >
              {/* Left: number + title */}
              <div className="col-span-12 md:col-span-4 flex items-start gap-4">
                <span className="font-display text-sm tabular-nums text-gold/80 tracking-[0.2em] pt-1">
                  0{index + 1}
                </span>
                <div>
                  <Icon className="w-5 h-5 text-gold mb-2 md:mb-3" />
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground leading-tight">
                    {t(lang, compTitleKeys[index])}
                  </h3>
                </div>
              </div>

              {/* Right: two stacked comparison lines */}
              <div className="col-span-12 md:col-span-8 space-y-5">
                <div className="flex gap-4">
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold shrink-0 w-28 md:w-32 pt-1">
                    {t(lang, "shortTerm_label")}
                  </span>
                  <p className="font-body text-base md:text-[17px] text-foreground leading-relaxed flex-1">
                    {t(lang, compShortKeys[index])}
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground shrink-0 w-28 md:w-32 pt-1">
                    {t(lang, "longTerm_label")}
                  </span>
                  <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed flex-1">
                    {t(lang, compLongKeys[index])}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBetterSection;
