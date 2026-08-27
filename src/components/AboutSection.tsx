import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/Reveal";
import { t } from "@/i18n/translations";

/**
 * "Kdo za tím stojí" — an article-like block on a soft secondary surface:
 * eyebrow, title, paragraphs and the closing quote share one left edge, and the
 * two proof numbers (~10 flats, 520+ reviews) sit in a gold-hairline rail:
 * a horizontal band under the title on phones, a right-hand rail on desktop.
 * Body keys with an empty value are skipped, so the VI page can use fewer.
 * The photo slot is removed for now; when Vuong supplies a photo, the rail can
 * make room for it (or bring back md:grid-cols-[minmax(0,320px)_1fr]).
 * CZ and VI copy are Vuong's approved words; do not rewrite them.
 */
/** Trimmed 27. 8. 2026: p1 (the edge) + p4 (origin + exact count) carry the section;
 *  p2/p3/p5 stay in translations but are not rendered — About should validate,
 *  not lecture. Owner testimonials get their place here once real ones exist. */
const BODY_KEYS = ["about_p2", "about_p4"] as const;
const STAT_KEYS = [
  { value: "about_stat1_value", label: "about_stat1_label" },
  { value: "about_stat2_value", label: "about_stat2_label" },
] as const;

const AboutSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="kdo-jsme" className="section bg-secondary scroll-mt-16">
      <div className="container-narrow">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="eyebrow mb-5">{t(lang, "about_label")}</p>
            <h2 className="h-section-sm text-foreground mb-6 md:mb-8">{t(lang, "about_title")}</h2>
          </Reveal>

          <div className="grid md:grid-cols-[minmax(0,1fr)_190px] gap-7 md:gap-12 items-start">
            <Reveal delay={0.1} className="order-first md:order-last">
              <div className="flex md:flex-col gap-8 md:gap-7 border-y md:border-y-0 md:border-l border-gold/30 py-4 md:py-1 md:pl-6">
                {STAT_KEYS.map(({ value, label }) => (
                  <div key={value}>
                    <p className="font-display text-3xl md:text-4xl font-semibold text-gold-deep leading-none tnum">
                      {t(lang, value)}
                    </p>
                    <p className="mt-2 font-body text-[11px] uppercase tracking-[0.14em] text-muted-foreground leading-snug">
                      {t(lang, label)}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <p className="font-body text-[17px] md:text-lg text-foreground leading-relaxed mb-5 text-pretty">
                {t(lang, "about_p1")}
              </p>
              {BODY_KEYS.map((key) => {
                const text = t(lang, key);
                if (!text) return null;
                return (
                  <p key={key} className="font-body text-base md:text-lg text-muted-foreground leading-relaxed mb-5 text-pretty">
                    {text}
                  </p>
                );
              })}
              <p className="font-display italic text-lg md:text-xl text-foreground/90 leading-relaxed border-l-2 border-gold/60 pl-4">
                {t(lang, "about_quote")}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
