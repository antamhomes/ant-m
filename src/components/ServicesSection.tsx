import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

type Item = {
  titleKey: TranslationKey;
  descKey: TranslationKey;
};

const items: Item[] = [
  { titleKey: "svc1_title", descKey: "svc1_desc" },
  { titleKey: "svc2_title", descKey: "svc2_desc" },
  { titleKey: "svc3_title", descKey: "svc3_desc" },
  { titleKey: "svc4_title", descKey: "svc4_desc" },
  { titleKey: "svc5_title", descKey: "svc5_desc" },
];

const ServicesSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="sluzby" className="py-16 md:py-20 px-6 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-4">
            {t(lang, "services_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-5">
            {t(lang, "services_title")}
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            {t(lang, "services_desc")}
          </p>
        </motion.div>

        {/* Editorial číslovaný seznam — klidný, čte se shora dolů */}
        <div className="max-w-3xl mx-auto">
          {items.map(({ titleKey, descKey }, index) => (
            <motion.article
              key={titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`grid grid-cols-[auto_1fr] gap-5 md:gap-10 py-7 md:py-9 ${
                index !== items.length - 1 ? "border-b border-border/60" : ""
              }`}
            >
              <div className="font-display text-2xl md:text-3xl text-gold/80 font-light tabular-nums leading-none pt-1 w-12 md:w-14">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-2 leading-snug">
                  {t(lang, titleKey)}
                </h3>
                <p className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed">
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

export default ServicesSection;
