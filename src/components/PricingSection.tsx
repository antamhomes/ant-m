import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const pointKeys: TranslationKey[] = ["pricing_point1", "pricing_point2", "pricing_point3"];

const PricingSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="cena" className="py-14 md:py-20 px-6 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "pricing_label")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-[1.2] tracking-tight">
            {t(lang, "pricing_title1")}
            <span className="text-gradient-gold">{t(lang, "pricing_title2")}</span>
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            {t(lang, "pricing_desc")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto bg-gradient-dark rounded-md p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <p className="font-display text-7xl md:text-8xl font-bold text-gradient-gold leading-none">
              {t(lang, "pricing_value")}
            </p>
            <p className="font-body text-sm md:text-base text-primary-foreground/70 mt-3 max-w-md mx-auto">
              {t(lang, "pricing_value_sub")}
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {pointKeys.map((k) => (
              <li
                key={k}
                className="flex items-start gap-2.5 px-4 py-3 rounded-sm border border-gold/25 bg-charcoal/30"
              >
                <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="font-body text-sm text-primary-foreground/90 leading-snug">
                  {t(lang, k)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center">
            <a
              href="#kalkulacka"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold/15 text-primary-foreground border border-gold/40 hover:bg-gold/25 hover:border-gold rounded-sm font-body text-sm font-medium tracking-[0.12em] uppercase transition-all"
            >
              {t(lang, "pricing_cta")}
              <ChevronRight className="w-4 h-4 text-gold" />
            </a>
          </div>

          <p className="font-body text-[11px] text-primary-foreground/50 text-center mt-6 max-w-xl mx-auto leading-relaxed">
            {t(lang, "pricing_note")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;