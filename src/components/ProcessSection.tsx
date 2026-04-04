import { motion } from "framer-motion";
import { MessageSquare, Paintbrush, Camera, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const icons = [MessageSquare, Paintbrush, Camera, TrendingUp];
const numberLabels = ["01", "02", "03", "04"];
const titleKeys = ["step1_title", "step2_title", "step3_title", "step4_title"] as const;
const descKeys = ["step1_desc", "step2_desc", "step3_desc", "step4_desc"] as const;

const ProcessSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-24 md:py-32 px-6 bg-gradient-dark">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "process_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary-foreground mb-6">
            {t(lang, "process_title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-8 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-sm hover:border-gold/30 transition-all duration-300 group"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <span className="font-body text-xs tracking-[0.2em] uppercase text-gold/60 mb-1 block">
                    {lang === "cs" ? "Krok" : "Bước"} {numberLabels[index]}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-primary-foreground mb-2">
                    {t(lang, titleKeys[index])}
                  </h3>
                  <p className="font-body text-primary-foreground/60 text-sm leading-relaxed">
                    {t(lang, descKeys[index])}
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

export default ProcessSection;
