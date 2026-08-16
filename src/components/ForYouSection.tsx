import { useEffect, useState } from "react";
import { Clock, ShieldCheck, TrendingUp, CalendarHeart, UserX, Plane } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: { icon: typeof Clock; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: UserX,         titleKey: "foryou1_title", descKey: "foryou1_desc" },
  { icon: Clock,         titleKey: "foryou2_title", descKey: "foryou2_desc" },
  { icon: TrendingUp,    titleKey: "foryou3_title", descKey: "foryou3_desc" },
  { icon: ShieldCheck,   titleKey: "foryou4_title", descKey: "foryou4_desc" },
  { icon: CalendarHeart, titleKey: "foryou5_title", descKey: "foryou5_desc" },
  { icon: Plane,         titleKey: "foryou6_title", descKey: "foryou6_desc" },
];

const DESKTOP = "(min-width: 768px)";

/** Phones get a compact 2×3 hairline grid with shorter copy (…_m keys); tablet and desktop keep the card grid. */
const useIsDesktop = () => {
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const onChange = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return desktop;
};

/** "This is for you if…" — the reader recognises their own situation before we talk numbers. */
const ForYouSection = () => {
  const { lang } = useLanguage();
  const desktop = useIsDesktop();

  return (
    <section id="pro-koho" className="section bg-secondary scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "foryou_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "foryou_title1")}
            <span className="text-gradient-gold">{t(lang, "foryou_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "foryou_desc")}</p>
        </Reveal>

        {desktop ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 max-w-6xl mx-auto">
            {items.map(({ icon: Icon, titleKey, descKey }, i) => (
              <Reveal
                key={titleKey} delay={stagger(i, 0.07)}
                className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5 md:gap-4 p-3.5 sm:p-4 md:p-6 rounded-sm bg-card border border-border hover:border-gold/40 transition-colors duration-300 h-full"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="font-display text-[15px] sm:text-[17px] md:text-[1.2rem] font-semibold text-foreground mb-1 md:mb-1.5 leading-snug text-balance">
                    {t(lang, titleKey)}
                  </h3>
                  <p className="font-body text-[13px] sm:text-sm md:text-base text-muted-foreground leading-normal sm:leading-relaxed text-pretty">
                    {t(lang, descKey)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          /* Phones: 2×3 grid without cards. Gold hairlines between the cells (left rule on the
             right column, top rule from the second row), icons bare, everything centred.
             Extra bottom room so the sticky CTA never sits on the last row. */
          <ul className="grid grid-cols-2 pb-10 list-none m-0 p-0">
            {items.map(({ icon: Icon, titleKey, descKey }, i) => (
              <Reveal
                as="li" key={titleKey} delay={stagger(i, 0.06)}
                className={`text-center px-3 pt-4 pb-[18px] ${i % 2 === 1 ? "border-l border-gold/30" : ""} ${i >= 2 ? "border-t border-gold/30" : ""}`}
              >
                <Icon className="w-[18px] h-[18px] text-gold mx-auto mb-[9px]" strokeWidth={1.8} aria-hidden="true" />
                <h3 className="font-display text-[14px] font-normal leading-[1.3] text-primary mb-[5px] text-balance">
                  {t(lang, `${titleKey}_m` as TranslationKey)}
                </h3>
                <p className="font-body text-[11.5px] leading-[1.5] text-primary/70 text-pretty m-0">
                  {t(lang, `${descKey}_m` as TranslationKey)}
                </p>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ForYouSection;
