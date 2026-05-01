import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const titleKeys = ["svc1_title", "svc2_title", "svc3_title", "svc4_title", "svc5_title"] as const;
const itemKeys = ["svc1_items", "svc2_items", "svc3_items", "svc4_items", "svc5_items"] as const;

const ServicesSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="sluzby" className="py-14 md:py-32 px-6 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "services_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            {t(lang, "services_title")}
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(lang, "services_desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {titleKeys.map((tk, index) => {
            const items = t(lang, itemKeys[index]) as unknown as string[];
            return (
              <motion.div
                key={tk}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-card border border-border p-5 md:p-8 rounded-sm"
              >
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6 pb-3 md:pb-4 border-b border-border">
                  {t(lang, tk)}
                </h3>
                <ul className="space-y-2.5 md:space-y-4">
                  {items.map((item: string) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="font-body text-sm md:text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
