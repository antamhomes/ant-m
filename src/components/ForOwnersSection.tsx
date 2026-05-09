import { motion } from "framer-motion";
import { Clock, Shield, FileText, CalendarHeart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: { icon: typeof Clock; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: Clock,         titleKey: "forOwners1_title", descKey: "forOwners1_desc" },
  { icon: Shield,        titleKey: "forOwners2_title", descKey: "forOwners2_desc" },
  { icon: FileText,      titleKey: "forOwners3_title", descKey: "forOwners3_desc" },
  { icon: CalendarHeart, titleKey: "forOwners4_title", descKey: "forOwners4_desc" },
];

const ForOwnersSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-14 md:py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "forOwners_label")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-[1.2] tracking-tight max-w-2xl mx-auto">
            {t(lang, "forOwners_title1")}
            <span className="text-gradient-gold">{t(lang, "forOwners_title2")}</span>
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            {t(lang, "forOwners_desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {items.map(({ icon: Icon, titleKey, descKey }, index) => (
            <motion.article
              key={titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group flex items-start gap-4 p-5 md:p-6 rounded-sm bg-card border border-border hover:border-gold/40 hover:shadow-lg transition-all duration-500"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-sm bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors duration-300">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-gold" strokeWidth={1.5} />
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-1.5">
                  {t(lang, titleKey)}
                </h3>
                <p className="font-body text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                  {t(lang, descKey)}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForOwnersSection;