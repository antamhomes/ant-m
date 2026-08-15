import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { reveal } from "@/lib/motion";

/** One honest line about price, placed right before the calculator. */
const PriceStrip = () => {
  const { lang } = useLanguage();
  return (
    <section aria-label={t(lang, "price_label")} className="bg-gradient-dark border-y border-gold/15">
      <motion.div {...reveal} className="container-wide py-8 md:py-10 text-center">
        <p className="eyebrow eyebrow-center mb-3">{t(lang, "price_label")}</p>
        <p className="font-display text-2xl md:text-[2rem] font-semibold text-primary-foreground tracking-tight text-balance">
          {t(lang, "price_line")}
        </p>
        <p className="font-body text-sm md:text-[15px] text-primary-foreground/65 mt-2 text-pretty max-w-2xl mx-auto">
          {t(lang, "price_sub")}
        </p>
      </motion.div>
    </section>
  );
};

export default PriceStrip;
