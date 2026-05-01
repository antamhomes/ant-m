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
    <section className="py-16 md:py-16 md:py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "whyBetter_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            {t(lang, "whyBetter_title1")}
            <span className="text-gradient-gold">{t(lang, "whyBetter_title2")}</span>
            {t(lang, "whyBetter_title3")}
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-3xl mx-auto">
            {t(lang, "whyBetter_desc")}
          </p>
        </motion.div>

        <div className="space-y-3 md:space-y-6">
          {compIcons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-sm border border-border bg-card overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-border bg-muted/40">
                <Icon className="w-5 h-5 text-gold shrink-0" />
                <h3 className="font-display text-base md:text-lg font-semibold text-foreground">
                  {t(lang, compTitleKeys[index])}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-4 md:p-6 relative">
                  <span className="inline-block font-body text-[11px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 md:mb-3">
                    {t(lang, "longTerm_label")}
                  </span>
                  <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                    {t(lang, compLongKeys[index])}
                  </p>
                </div>

                <div className="p-4 md:p-6 bg-gold/5 relative">
                  <span className="inline-block font-body text-[11px] md:text-xs font-semibold uppercase tracking-wider text-gold mb-2 md:mb-3">
                    {t(lang, "shortTerm_label")}
                  </span>
                  <p className="font-body text-sm md:text-base text-foreground leading-relaxed">
                    {t(lang, compShortKeys[index])}
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
