import { motion } from "framer-motion";
import realBedroomLuxury from "@/assets/real-bedroom-luxury.jpg";
import realLivingCozy from "@/assets/real-living-cozy.jpg";
import apartmentBathroom from "@/assets/apartment-bathroom.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const cards: { src: string; titleKey: TranslationKey; descKey: TranslationKey; alt: string }[] = [
  { src: realBedroomLuxury, titleKey: "detail1_title", descKey: "detail1_desc", alt: "Připravená ložnice pro hosty" },
  { src: realLivingCozy, titleKey: "detail2_title", descKey: "detail2_desc", alt: "Čistý obývací prostor" },
  { src: apartmentBathroom, titleKey: "detail3_title", descKey: "detail3_desc", alt: "Detail péče o byt" },
];

const BeforeAfterSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-16 md:py-16 md:py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-gold/80 font-body text-xs tracking-[0.3em] uppercase mb-3">
            {t(lang, "beforeAfter_label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-5">
            {t(lang, "beforeAfter_title")}
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            {t(lang, "beforeAfter_desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <motion.article
              key={card.titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-sm overflow-hidden bg-card border border-border hover:border-gold/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={card.src}
                  alt={card.alt}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1100ms] ease-out"
                  loading="lazy"
                  width={1200}
                  height={1500}
                />
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-charcoal via-charcoal/80 via-40% to-transparent" />
                <div className="absolute left-5 right-5 bottom-5 text-primary-foreground [text-shadow:0_1px_10px_hsl(var(--charcoal)/0.6)]">
                  <h3 className="font-display text-lg md:text-xl font-semibold mb-2 leading-snug">
                    {t(lang, card.titleKey)}
                  </h3>
                  <p className="font-body text-[13px] md:text-sm text-primary-foreground/90 leading-relaxed">
                    {t(lang, card.descKey)}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
