import { motion } from "framer-motion";
import { Clock, ShieldCheck, TrendingUp, CalendarHeart, UserX, Plane } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { reveal, revealDelayed, stagger } from "@/lib/motion";

const items: { icon: typeof Clock; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: UserX,         titleKey: "foryou1_title", descKey: "foryou1_desc" },
  { icon: Clock,         titleKey: "foryou2_title", descKey: "foryou2_desc" },
  { icon: TrendingUp,    titleKey: "foryou3_title", descKey: "foryou3_desc" },
  { icon: ShieldCheck,   titleKey: "foryou4_title", descKey: "foryou4_desc" },
  { icon: CalendarHeart, titleKey: "foryou5_title", descKey: "foryou5_desc" },
  { icon: Plane,         titleKey: "foryou6_title", descKey: "foryou6_desc" },
];

/** "This is for you if…" — the reader recognises their own situation before we talk numbers. */
const ForYouSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="pro-koho" className="section bg-secondary scroll-mt-16">
      <div className="container-wide">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "foryou_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "foryou_title1")}
            <span className="text-gradient-gold">{t(lang, "foryou_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "foryou_desc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
          {items.map(({ icon: Icon, titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              {...revealDelayed(stagger(i, 0.07))}
              className="flex items-start gap-3.5 md:gap-4 p-4 md:p-6 rounded-sm bg-card border border-border hover:border-gold/40 transition-colors duration-300 h-full"
            >
              <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gold" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-display text-[17px] md:text-[1.2rem] font-semibold text-foreground mb-1 md:mb-1.5 leading-snug">
                  {t(lang, titleKey)}
                </h3>
                <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed text-pretty">
                  {t(lang, descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForYouSection;
