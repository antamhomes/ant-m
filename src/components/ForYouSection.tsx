import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, CalendarHeart, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: {
  icon: typeof ShieldCheck;
  titleKey: TranslationKey;
  antamKey: TranslationKey;
  longKey: TranslationKey;
}[] = [
  { icon: ShieldCheck,   titleKey: "foryou1_title", antamKey: "foryou1_antam", longKey: "foryou1_long" },
  { icon: TrendingUp,    titleKey: "foryou2_title", antamKey: "foryou2_antam", longKey: "foryou2_long" },
  { icon: CalendarHeart, titleKey: "foryou3_title", antamKey: "foryou3_antam", longKey: "foryou3_long" },
  { icon: Wallet,        titleKey: "foryou4_title", antamKey: "foryou4_antam", longKey: "foryou4_long" },
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
          {items.map(({ icon: Icon, titleKey, antamKey, longKey }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-5 md:p-6 rounded-sm bg-card border border-border hover:border-gold/40 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">
                  {t(lang, titleKey)}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="rounded-sm bg-gold/5 border-l-2 border-gold px-3 py-2.5">
                  <span className="block font-body text-[10px] font-semibold uppercase tracking-wider text-gold mb-1">
                    {t(lang, "foryou_antam_label")}
                  </span>
                  <p className="font-body text-sm text-foreground leading-relaxed">
                    {t(lang, antamKey)}
                  </p>
                </div>
                <div className="px-3 py-2.5">
                  <span className="block font-body text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {t(lang, "foryou_long_label")}
                  </span>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {t(lang, longKey)}
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

export default ForYouSection;