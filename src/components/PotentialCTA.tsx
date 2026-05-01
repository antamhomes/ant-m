import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const PotentialCTA = () => {
  const { lang } = useLanguage();
  return (
    <section className="py-20 md:py-24 px-6 bg-gradient-dark">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-5xl font-semibold text-primary-foreground mb-6"
        >
          {t(lang, "potential_title1")}
          <span className="text-gradient-gold">{t(lang, "potential_title2")}</span>
        </motion.h2>
        <p className="font-body text-primary-foreground/70 text-lg max-w-2xl mx-auto mb-10">
          {t(lang, "potential_desc")}
        </p>
        <a
          href="#kontakt"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-accent-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:brightness-110 transition-all"
        >
          {t(lang, "potential_cta")}
          <ChevronRight className="w-4 h-4" />
        </a>
        <p className="font-body text-xs text-primary-foreground/50 mt-5">
          {t(lang, "potential_note")}
        </p>
      </div>
    </section>
  );
};

export default PotentialCTA;
