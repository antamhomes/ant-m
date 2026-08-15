import { motion } from "framer-motion";
import { TrendingUp, Shield, FileText, Headset, LineChart, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { reveal, revealDelayed, stagger } from "@/lib/motion";

const icons = [TrendingUp, FileText, Shield, Headset, LineChart, Award];
const titleKeys = ["benefit1_title", "benefit2_title", "benefit3_title", "benefit4_title", "benefit5_title", "benefit6_title"] as const;
const descKeys = ["benefit1_desc", "benefit2_desc", "benefit3_desc", "benefit4_desc", "benefit5_desc", "benefit6_desc"] as const;

const BenefitsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="section bg-background">
      <div className="container-wide">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "benefits_label")}</p>
          <h2 className="h-section text-foreground max-w-4xl mx-auto">
            <span className="block">{t(lang, "benefits_title1")}</span>
            <span className="block text-gradient-gold">{t(lang, "benefits_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "benefits_desc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-3 md:gap-5">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              {...revealDelayed(stagger(index))}
              className="group h-full p-5 md:p-7 rounded-sm bg-card border border-border hover:border-gold/40 transition-colors duration-300 flex md:block items-start gap-4"
            >
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-sm bg-gold/10 flex items-center justify-center shrink-0 md:mb-5 group-hover:bg-gold/20 transition-colors duration-300">
                <Icon className="w-5 h-5 text-gold" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-1.5 md:mb-2 leading-snug">
                  {t(lang, titleKeys[index])}
                </h3>
                <p className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed text-pretty">
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
