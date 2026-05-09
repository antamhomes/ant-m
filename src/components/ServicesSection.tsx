import { motion } from "framer-motion";
import { FileText, MessageSquare, Sparkles, LineChart, FileBarChart, Wrench } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: { icon: typeof FileText; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: FileText,     titleKey: "svc1_title", descKey: "svc1_desc" },
  { icon: LineChart,    titleKey: "svc2_title", descKey: "svc2_desc" },
  { icon: MessageSquare,titleKey: "svc3_title", descKey: "svc3_desc" },
  { icon: Sparkles,     titleKey: "svc4_title", descKey: "svc4_desc" },
  { icon: Wrench,       titleKey: "svc5_title", descKey: "svc5_desc" },
  { icon: FileBarChart, titleKey: "svc6_title", descKey: "svc6_desc" },
];

const ServicesSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="sluzby" className="relative py-16 md:py-20 px-6 bg-gradient-dark border-y border-gold/15 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-1/3 h-[60%] opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(var(--gold) / 0.18), transparent 60%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <p className="eyebrow eyebrow-center mb-4">
            {t(lang, "services_label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-primary-foreground mb-5">
            {t(lang, "services_title")}
          </h2>
          <p className="font-body text-primary-foreground/70 text-base md:text-lg max-w-2xl mx-auto">
            {t(lang, "services_desc")}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {items.map(({ icon: Icon, titleKey, descKey }, index) => (
            <motion.article
              key={titleKey}
              initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.45 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ x: 6, transition: { duration: 0.25 } }}
              className={`group grid grid-cols-[auto_1fr] gap-5 md:gap-8 py-5 md:py-6 cursor-default ${
                index !== items.length - 1 ? "border-b border-primary-foreground/10" : ""
              }`}
            >
              <motion.div
                className="shrink-0 pt-1 relative"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3 + index * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4,
                }}
              >
                <span className="absolute inset-0 rounded-full bg-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Icon
                  className="relative w-7 h-7 md:w-8 md:h-8 text-gold transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6"
                  strokeWidth={1.25}
                />
              </motion.div>
              <div className="pt-1">
                <h3 className="font-display text-xl md:text-2xl font-semibold text-primary-foreground mb-2 leading-snug transition-colors duration-300 group-hover:text-gold">
                  {t(lang, titleKey)}
                </h3>
                <p className="font-body text-[15px] md:text-base text-primary-foreground/70 leading-relaxed">
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
