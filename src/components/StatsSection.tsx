import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const valueKeys = ["stat1_value", "stat2_value", "stat3_value", "stat4_value"] as const;
const labelKeys = ["stat1_label", "stat2_label", "stat3_label", "stat4_label"] as const;

const StatsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-10 md:py-12 bg-gradient-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {valueKeys.map((vk, index) => (
            <motion.div
              key={vk}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-gradient-gold mb-1">
                {t(lang, vk)}
              </div>
              <div className="font-body text-[10px] sm:text-xs text-primary-foreground/60 tracking-[0.15em] uppercase leading-snug">
                {t(lang, labelKeys[index])}
              </div>
            </motion.div>
          ))}
        </div>
        <p className="font-body text-[11px] text-primary-foreground/45 text-center mt-6 max-w-2xl mx-auto leading-relaxed">
          {t(lang, "stats_disclaimer")}
        </p>
      </div>
    </section>
  );
};

export default StatsSection;
