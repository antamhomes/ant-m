import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { reveal } from "@/lib/motion";

/**
 * The price, said once and plainly, right before the calculator.
 * Light surface (not another dark band): the big "25 %" is the highlight,
 * everything else steps back.
 */
const PriceStrip = () => {
  const { lang } = useLanguage();
  return (
    <section id="cena" aria-label={t(lang, "price_label")} className="bg-background border-y border-border scroll-mt-16">
      <motion.div
        {...reveal}
        className="container-narrow py-9 md:py-11 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 text-center md:text-left"
      >
        <div className="flex items-baseline gap-3 shrink-0">
          <span className="font-display font-semibold text-gold-deep text-[3.25rem] md:text-[4rem] leading-none tracking-[-0.02em] tnum">
            {t(lang, "price_figure")}
          </span>
          <span className="font-display text-lg md:text-2xl text-foreground leading-tight whitespace-nowrap">
            {t(lang, "price_line")}
          </span>
        </div>
        <div aria-hidden="true" className="hidden md:block w-px self-stretch bg-border" />
        <p className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed max-w-[44ch] text-pretty">
          {t(lang, "price_sub")}
        </p>
      </motion.div>
    </section>
  );
};

export default PriceStrip;
