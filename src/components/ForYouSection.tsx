import { motion } from "framer-motion";
import { Clock, ShieldCheck, TrendingUp, CalendarHeart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: { icon: typeof Clock; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: Clock,         titleKey: "foryou1_title", descKey: "foryou1_desc" },
  { icon: ShieldCheck,   titleKey: "foryou2_title", descKey: "foryou2_desc" },
  { icon: TrendingUp,    titleKey: "foryou3_title", descKey: "foryou3_desc" },
  { icon: CalendarHeart, titleKey: "foryou4_title", descKey: "foryou4_desc" },
];

const ForYouSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-14 md:py-20 px-6 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "foryou_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-5 leading-tight">
            {t(lang, "foryou_title1")}
            <span className="text-gradient-gold">{t(lang, "foryou_title2")}</span>
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            {t(lang, "foryou_desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
          {items.map(({ icon: Icon, titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-start gap-4 p-5 md:p-6 rounded-sm bg-card border border-border hover:border-gold/40 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-1.5">
                  {t(lang, titleKey)}
                </h3>
                <p className="font-body text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                  {t(lang, descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForYouSection;