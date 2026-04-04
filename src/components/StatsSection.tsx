import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const valueKeys = ["stat1_value", "stat2_value", "stat3_value", "stat4_value"] as const;
const labelKeys = ["stat1_label", "stat2_label", "stat3_label", "stat4_label"] as const;

const StatsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-20 bg-gradient-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {valueKeys.map((vk, index) => (
            <motion.div
              key={vk}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-2">
                {t(lang, vk)}
              </div>
              <div className="font-body text-sm text-primary-foreground/60 tracking-wider uppercase">
                {t(lang, labelKeys[index])}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
