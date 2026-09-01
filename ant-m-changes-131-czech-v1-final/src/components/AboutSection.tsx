import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/Reveal";
import { t, type TranslationKey } from "@/i18n/translations";

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
/** 28. 8. 2026: CZ runs p1 (what we do daily) + p2 (what actually decides a flat's
 *  result) + p4 (origin and the review count), closed by the quote. VI keeps the
 *  shorter cut it already had; its own p2 is a different, longer paragraph and was
 *  not part of this pass. p3/p5 stay in translations but are not rendered.
 *  Owner testimonials get their place here once real ones exist. */
const BODY_KEYS: Record<"cs" | "vi", readonly TranslationKey[]> = {
  // 2C: about_p2/p3 byly provozní obsah a přestěhovaly se do sekce
  // Co za vás řešíme. Tady zůstává, kdo Antam je a jak přemýšlí.
  // QA-13: about_scale ("jednotlivé byty i více jednotek") říká totéž co
  // "Máte bytů víc? Každý má vlastní vyúčtování." ve Vyúčtování, které je
  // konkrétnější. V CZ se proto nerenderuje; VI zůstává beze změny.
  cs: ["about_p4", "about_p5"],
  vi: ["about_p4", "about_scale"],
};
/** Stats with an empty value are skipped: the CZ page dropped the managed-flat
 *  count (a weak proof next to the portfolio itself), the VI page still shows it. */
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
          <Reveal className="section-head">
            <p className="eyebrow eyebrow-center">{t(lang, "about_label")}</p>
            <h2 className="h-section-sm text-foreground">{t(lang, "about_title")}</h2>
          </Reveal>

          <div className="grid md:grid-cols-[minmax(0,1fr)_248px] gap-7 md:gap-10 items-start">
            {/* 2D: pravý sloupec nesl jen dvě čísla a pod nimi dvě třetiny
                prázdna. Citát zakladatele se sem přesunul z levého sloupce.
                Je to existující materiál, drží stranu vyváženou a pod čísly
                se čte jako podpis, ne jako ozdoba. Na mobilu zůstává pořadí
                stejné jako dřív: čísla nahoře, citát na konci sekce. */}
            <Reveal delay={0.1} className="order-first md:order-last contents md:block">
              <div className="flex md:flex-col gap-8 md:gap-7 border-y md:border-y-0 md:border-l border-gold/30 py-4 md:py-1 md:pl-6 order-first">
                {STAT_KEYS.filter(({ value }) => t(lang, value)).map(({ value, label }) => (
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
              {t(lang, "about_quote") && (
                <div className="border-l-2 border-gold/60 pl-4 mt-7 md:mt-9 md:ml-6 order-last">
                  <p className="font-display italic text-[17px] md:text-lg text-foreground/90 leading-relaxed text-pretty">
                    {t(lang, "about_quote")}
                  </p>
                  {t(lang, "about_sign") && (
                    <p className="mt-3 font-body text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                      {t(lang, "about_sign")}
                    </p>
                  )}
                </div>
              )}
            </Reveal>

            <Reveal delay={0.05}>
              <p className="font-body text-[17px] md:text-lg text-foreground leading-relaxed mb-5 text-pretty">
                {t(lang, "about_p1")}
              </p>
              {BODY_KEYS[lang].map((key) => {
                const text = t(lang, key);
                if (!text) return null;
                return (
                  <p key={key} className="font-body text-base md:text-lg text-muted-foreground leading-relaxed mb-5 text-pretty">
                    {text}
                  </p>
                );
              })}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
