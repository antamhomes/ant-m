import { motion } from "framer-motion";
import { ShieldCheck, Eye, TrendingUp, Wrench, CalendarCheck, AlertTriangle, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const compIcons = [Eye, Wrench, TrendingUp, ShieldCheck, CalendarCheck, AlertTriangle];
const compTitleKeys = ["comp1_title", "comp2_title", "comp3_title", "comp4_title", "comp5_title", "comp6_title"] as const;
const compLongKeys = ["comp1_long", "comp2_long", "comp3_long", "comp4_long", "comp5_long", "comp6_long"] as const;
const compShortKeys = ["comp1_short", "comp2_short", "comp3_short", "comp4_short", "comp5_short", "comp6_short"] as const;

const moneyValueKeys = ["money1_value", "money2_value", "money3_value"] as const;
const moneyLabelKeys = ["money1_label", "money2_label", "money3_label"] as const;

const WhyBetterSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
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

        <div className="space-y-6 mb-20">
          {compIcons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-sm border border-border bg-card overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/40">
                <Icon className="w-5 h-5 text-gold shrink-0" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {t(lang, compTitleKeys[index])}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6 relative">
                  <span className="inline-block font-body text-xs font-semibold uppercase tracking-wider text-destructive/70 mb-3">
                    {t(lang, "longTerm_label")}
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {t(lang, compLongKeys[index])}
                  </p>
                </div>

                <div className="p-6 bg-gold/5 relative">
                  <span className="inline-block font-body text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                    {t(lang, "shortTerm_label")}
                  </span>
                  <p className="font-body text-foreground leading-relaxed">
                    {t(lang, compShortKeys[index])}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-dark rounded-md p-8 md:p-12"
        >
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground text-center mb-10">
            {t(lang, "moneyFacts_title1")}
            <span className="text-gradient-gold">{t(lang, "moneyFacts_title2")}</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {moneyValueKeys.map((vk, i) => (
              <motion.div
                key={vk}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div
                  className={`font-display text-3xl md:text-4xl font-bold mb-2 ${
                    i === 2 ? "text-gradient-gold" : "text-primary-foreground"
                  }`}
                >
                  {t(lang, vk)}
                </div>
                <p className="font-body text-sm text-primary-foreground/60">
                  {t(lang, moneyLabelKeys[i])}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-accent-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:brightness-110 transition-all"
            >
              {t(lang, "moneyFacts_cta")}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyBetterSection;
