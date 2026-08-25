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

/** Phones read the shorter …_m copy; tablet and desktop get the full sentences. */
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

        {/* One grid without cards, on every screen: gold hairlines between the cells, icons
           bare, everything centred. Phones keep the tight 2×3 with the short …_m copy;
           tablet and desktop scale the same grid up to the old card sizes with the full
           sentences, lg opens into 3×2. The border-l/border-t toggles per breakpoint follow
           the column count (left rule on non-first columns, top rule from the second row).
           Extra bottom room on phones so the sticky CTA never sits on the last row. */}
        <ul className="grid grid-cols-2 lg:grid-cols-3 max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto pb-10 md:pb-0 list-none m-0 p-0">
          {items.map(({ icon: Icon, titleKey, descKey }, i) => {
            const left2 = i % 2 === 1, top2 = i >= 2;   // 2 columns (phone, tablet)
            const left3 = i % 3 !== 0, top3 = i >= 3;   // 3 columns (lg and up)
            const rules = [
              left2 ? "border-l" : "",
              top2 ? "border-t" : "",
              left3 !== left2 ? (left3 ? "lg:border-l" : "lg:border-l-0") : "",
              top3 !== top2 ? (top3 ? "lg:border-t" : "lg:border-t-0") : "",
            ].filter(Boolean).join(" ");
            return (
            <Reveal
              as="li" key={titleKey} delay={stagger(i, 0.06)}
              className={`text-center border-gold/30 px-3 pt-4 pb-[18px] md:px-6 md:pt-7 md:pb-8 ${rules}`}
            >
              <Icon className="w-[18px] h-[18px] md:w-6 md:h-6 text-gold mx-auto mb-[9px] md:mb-3" strokeWidth={1.8} aria-hidden="true" />
              <h3 className="font-display text-[14px] md:text-[1.2rem] font-normal md:font-medium leading-[1.3] text-primary mb-[5px] md:mb-2 text-balance">
                {t(lang, desktop ? titleKey : `${titleKey}_m` as TranslationKey)}
              </h3>
              <p className="font-body text-[11.5px] md:text-base leading-[1.5] md:leading-relaxed text-primary/70 text-pretty m-0">
                {t(lang, desktop ? descKey : `${descKey}_m` as TranslationKey)}
              </p>
            </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default ForYouSection;
