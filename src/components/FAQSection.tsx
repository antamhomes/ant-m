import { useState } from "react";
import Reveal from "@/components/Reveal";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

type Item = { q: TranslationKey; a: TranslationKey };
type Group = { title: TranslationKey; items: Item[] };

// Grouped by what the owner is actually asking about. Order inside a group =
// how often the question comes up.
// Osm otázek, které jsou skutečné námitky investora (rozhodnutí 30. 8. 2026);
// zbytek (jak fotíme, platformy, proč ne sám…) z webu zmizel, odpovědi na ně
// nese schůzka a MCP. Klíče v translations zůstávají.
const groups: Group[] = [
  {
    title: "faq_group_money",
    items: [
      { q: "faq18_q", a: "faq18_a" }, // garance výnosu
      { q: "faq4_q", a: "faq4_a" },   // přehled + vyúčtování (kdy chodí peníze)
      { q: "faq6_q", a: "faq6_a" },   // úklid a energie
    ],
  },
  {
    title: "faq_group_flat",
    items: [
      { q: "faq11_q", a: "faq11_a" }, // škody
      { q: "faq12_q", a: "faq12_a" }, // sousedé / SVJ
      { q: "faq10_q", a: "faq10_a" }, // povinnosti a daně
    ],
  },
  {
    title: "faq_group_coop",
    items: [
      { q: "faq3_q", a: "faq3_a" },   // byt pro sebe
      { q: "faq7_q", a: "faq7_a" },   // doba / výpověď
    ],
  },
];

const MOBILE_VISIBLE = 5; // questions shown on mobile before "show more"

const FAQSection = () => {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState<TranslationKey | null>(null);
  let flatIndex = 0;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="faq" className="section bg-background scroll-mt-20">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "faq_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "faq_title")}</h2>
        </Reveal>

        <Reveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6 md:gap-y-0">
          {groups.map((g) => (
            <div key={g.title}>
              <h3
                className={`font-body text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-deep mb-2 ${
                  flatIndex >= MOBILE_VISIBLE && !expanded ? "hidden md:block" : ""
                }`}
              >
                {t(lang, g.title)}
              </h3>
              <div className="w-full">
                {g.items.map(({ q, a }) => {
                  const idx = flatIndex++;
                  const hiddenOnMobile = idx >= MOBILE_VISIBLE && !expanded;
                  const isOpen = open === q;
                  return (
                    <div key={q} className={`border-b border-border ${hiddenOnMobile ? "hidden md:block" : ""}`}>
                      <h4 className="m-0">
                        <button
                          type="button"
                          id={`faq-q-${q}`}
                          aria-expanded={isOpen}
                          aria-controls={`faq-a-${q}`}
                          onClick={() => setOpen(isOpen ? null : q)}
                          className="flex w-full items-center justify-between gap-4 font-display text-base md:text-[17px] font-semibold text-foreground text-left py-3.5 md:py-4 leading-snug"
                        >
                          {t(lang, q)}
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </button>
                      </h4>
                      {/* grid-rows 0fr→1fr animates height without measuring; older browsers just snap. */}
                      <div
                        id={`faq-a-${q}`}
                        role="region"
                        aria-labelledby={`faq-q-${q}`}
                        className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                      >
                        <div className="overflow-hidden">
                          <p
                            className="font-body text-[15px] text-muted-foreground leading-relaxed pb-5 pr-6 text-pretty"
                            dangerouslySetInnerHTML={{ __html: t(lang, a) }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Reveal>

        {/* Mobile only: the rest of the questions on demand */}
        <div className="md:hidden mt-5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-gold-deep underline underline-offset-4 decoration-gold/40"
            aria-expanded={expanded}
          >
            {expanded ? t(lang, "faq_less") : `${t(lang, "faq_more")} (${total - MOBILE_VISIBLE})`}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
