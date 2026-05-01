import { motion } from "framer-motion";
import { FileText, MessageSquare, Sparkles, LineChart, FileBarChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: { icon: typeof FileText; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: FileText,     titleKey: "svc1_title", descKey: "svc1_desc" },
  { icon: MessageSquare,titleKey: "svc2_title", descKey: "svc2_desc" },
  { icon: Sparkles,     titleKey: "svc3_title", descKey: "svc3_desc" },
  { icon: LineChart,    titleKey: "svc4_title", descKey: "svc4_desc" },
  { icon: FileBarChart, titleKey: "svc5_title", descKey: "svc5_desc" },
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

        <div className="max-w-3xl mx-auto">
          {items.map(({ icon: Icon, titleKey, descKey }, index) => (
            <motion.article
              key={titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`grid grid-cols-[auto_1fr] gap-5 md:gap-8 py-7 md:py-9 ${
                index !== items.length - 1 ? "border-b border-border/60" : ""
              }`}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-md border border-gold/30 bg-background/60 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-gold" strokeWidth={1.5} />
              </div>
              <div className="pt-1">
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
