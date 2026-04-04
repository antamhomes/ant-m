import { motion } from "framer-motion";
import { TrendingUp, Shield, Clock, Wrench, Star, Banknote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const icons = [Banknote, Wrench, Shield, Clock, TrendingUp, Star];
const titleKeys = ["benefit1_title", "benefit2_title", "benefit3_title", "benefit4_title", "benefit5_title", "benefit6_title"] as const;
const descKeys = ["benefit1_desc", "benefit2_desc", "benefit3_desc", "benefit4_desc", "benefit5_desc", "benefit6_desc"] as const;

const BenefitsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "benefits_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            {t(lang, "benefits_title1")}<span className="text-gradient-gold">{t(lang, "benefits_title2")}</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(lang, "benefits_desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-sm bg-card border border-border hover:border-gold/30 transition-all duration-500 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-sm bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors duration-300">
                <Icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {t(lang, titleKeys[index])}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {t(lang, descKeys[index])}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
