import { motion } from "framer-motion";
import { TrendingUp, Shield, FileText, Headset, LineChart, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const icons = [TrendingUp, FileText, Shield, Headset, LineChart, Award];
const titleKeys = ["benefit1_title", "benefit2_title", "benefit3_title", "benefit4_title", "benefit5_title", "benefit6_title"] as const;
const descKeys = ["benefit1_desc", "benefit2_desc", "benefit3_desc", "benefit4_desc", "benefit5_desc", "benefit6_desc"] as const;

const BenefitsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-20 md:py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <p className="eyebrow eyebrow-center mb-7">
            {t(lang, "benefits_label")}
          </p>
          <h2 className="font-display text-[2.25rem] sm:text-5xl md:text-[3.75rem] lg:text-[4.5rem] font-semibold tracking-[-0.025em] text-foreground mb-8 leading-[1.04] max-w-4xl mx-auto text-balance">
            <span className="block text-foreground">{t(lang, "benefits_title1")}</span>
            <span className="block text-gradient-gold italic font-medium mt-3 md:mt-4">{t(lang, "benefits_title2")}</span>
          </h2>
          <div className="mx-auto w-12 h-px bg-gold/40 mb-7" />
          <p className="font-body text-muted-foreground text-base md:text-[1.0625rem] max-w-xl mx-auto leading-[1.7]">
            {t(lang, "benefits_desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-7">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-5 md:p-8 rounded-sm bg-card border border-border hover:border-gold/40 hover:-translate-y-0.5 transition-all duration-500 hover:shadow-elegant flex md:block items-start gap-4"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-sm bg-gold/10 flex items-center justify-center shrink-0 md:mb-7 group-hover:bg-gold/20 group-hover:scale-105 transition-all duration-300">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-gold" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3 tracking-[-0.01em]">
                  {t(lang, titleKeys[index])}
                </h3>
                <p className="font-body text-sm md:text-[15px] text-muted-foreground leading-[1.65]">
                  {t(lang, descKeys[index])}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
