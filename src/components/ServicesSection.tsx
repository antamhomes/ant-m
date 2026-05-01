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
    // Velká karta vlevo: 2 sloupce x 2 řádky na desktopu
    className: "md:col-span-2 md:row-span-2",
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
    // Široká karta dole
    className: "md:col-span-2",
  },
  {
    icon: FileBarChart,
    titleKey: "svc5_title",
    descKey: "svc5_desc",
    className: "md:col-span-2",
  },
];

const ServicesSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="sluzby" className="py-16 md:py-32 px-6 bg-secondary">
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

        {/* Bento grid: 4 sloupce na desktopu */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-4 md:gap-5">
          {items.map(({ icon: Icon, titleKey, descKey, className }, index) => (
            <motion.article
              key={titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden bg-card border border-border rounded-md p-6 md:p-8 hover:border-gold/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--charcoal)/0.35)] transition-all duration-500 ${className}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">
                  {t(lang, titleKey)}
                </h3>
              </div>
              <p className="font-body text-sm md:text-[15px] text-muted-foreground leading-relaxed max-w-prose">
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
