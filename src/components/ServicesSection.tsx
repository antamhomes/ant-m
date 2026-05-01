import { motion } from "framer-motion";
import { FileText, MessageSquare, Sparkles, LineChart, FileBarChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

type Item = {
  icon: typeof FileText;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  className: string; // grid placement classes
};

const items: Item[] = [
  {
    icon: MessageSquare,
    titleKey: "svc2_title",
    descKey: "svc2_desc",
    className: "",
  },
  {
    icon: FileText,
    titleKey: "svc1_title",
    descKey: "svc1_desc",
    className: "",
  },
  {
    icon: Sparkles,
    titleKey: "svc3_title",
    descKey: "svc3_desc",
    className: "",
  },
  {
    icon: LineChart,
    titleKey: "svc4_title",
    descKey: "svc4_desc",
    className: "",
  },
  {
    icon: FileBarChart,
    titleKey: "svc5_title",
    descKey: "svc5_desc",
    className: "",
  },
];

const ServicesSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="sluzby" className="py-16 md:py-16 md:py-20 px-6 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
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

        {/* Uniform 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map(({ icon: Icon, titleKey, descKey, className }, index) => (
            <motion.article
              key={titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden bg-card border border-border rounded-lg p-7 md:p-8 h-full hover:border-gold/50 hover:shadow-[0_20px_50px_-25px_hsl(var(--charcoal)/0.25)] transition-all duration-500 ${className}`}
            >
              <div className="w-11 h-11 rounded-md bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/15 transition-colors">
                <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl md:text-[22px] font-semibold text-foreground mb-3 leading-snug">
                {t(lang, titleKey)}
              </h3>
              <p className="font-body text-[15px] text-muted-foreground leading-relaxed">
                {t(lang, descKey)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
