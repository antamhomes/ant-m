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
export type FaqVariant = "managed" | "own";
const GROUPS: Record<FaqVariant, Group[]> = {
  managed: [
    {
      title: "faq_group_money",
      items: [
        { q: "faq9_q", a: "faq9_a" },   // číslo v kalkulačce je PO odměně
        { q: "faq18_q", a: "faq18_a" }, // garance výnosu
        { q: "faq4_q", a: "faq4_a" },   // přehled + vyúčtování
        { q: "faq6_q", a: "faq6_a" },   // úklid a energie
        { q: "faq16_q", a: "faq16_a" }, // kolik stojí příprava
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
        { q: "faq19_q", a: "faq19_a" }, // přechod mezi cestami
      ],
    },
  ],
  // Vlastní provoz (2. 11. 2026): co za to dostanu, proč 20 % u vybavení, kolik času,
  // přechod na správu, povinnosti, SVJ, proč ne úplně sám.
  own: [
    {
      title: "faq_group_system",
      items: [
        { q: "faq20_q", a: "faq20_a" },
        { q: "faq21_q", a: "faq21_a" },
        { q: "faq22_q", a: "faq22_a" },
      ],
    },
    {
      title: "faq_group_flat",
      items: [
        { q: "faq10_q", a: "faq10_a" },
        { q: "faq12_q", a: "faq12_a" },
      ],
    },
    {
      title: "faq_group_coop",
      items: [
        { q: "faq19_q", a: "faq19_a" },
        { q: "faq14_q", a: "faq14_a" },
      ],
    },
  ],
};

const MOBILE_VISIBLE = 5; // questions shown on mobile before "show more"

const FAQSection = ({ variant = "managed" }: { variant?: FaqVariant }) => {
  const { lang } = useLanguage();
  const groups = GROUPS[variant];
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState<TranslationKey | null>(null);
  let flatIndex = 0;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="faq" className="section-tight bg-background scroll-mt-20 chapter-edge">
      <div className="container-wide">
        <Reveal className="section-head">
          <h2 className="h-section-sm text-foreground">{t(lang, "faq_title")}</h2>
        </Reveal>

        {/* 2. 11. 2026 (vizuál, polish): akordeon zůstává (je to UX vzor, ne
            problém), ale v jednom sloupci, bez karet, s vlasovou linkou mezi
            otázkami a znaménkem + místo šipky. */}
        <Reveal delay={0.1} className="max-w-[46rem]">
          {groups.map((g) => (
            <div key={g.title} className="mb-9 last:mb-0">
              <h3
                className={`font-body text-[13px] text-muted-foreground mb-1 ${
                  flatIndex >= MOBILE_VISIBLE && !expanded ? "hidden md:block" : ""
                }`}
              >
                {t(lang, g.title)}
              </h3>
              {g.items.map(({ q, a }) => {
                const idx = flatIndex++;
                const hiddenOnMobile = idx >= MOBILE_VISIBLE && !expanded;
                const isOpen = open === q;
                return (
                  <div key={q} className={`border-t border-foreground/15 ${hiddenOnMobile ? "hidden md:block" : ""}`}>
                    <h4 className="m-0">
                      <button
                        type="button"
                        id={`faq-q-${q}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-a-${q}`}
                        onClick={() => setOpen(isOpen ? null : q)}
                        className="flex w-full items-baseline justify-between gap-6 font-body text-[17px] md:text-[18px] font-medium text-foreground text-left py-4 md:py-[1.15rem] leading-snug"
                      >
                        {t(lang, q)}
                        <span aria-hidden="true" className={`shrink-0 font-body text-xl font-normal text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>+</span>
                      </button>
                    </h4>
                    <div
                      id={`faq-a-${q}`}
                      role="region"
                      aria-labelledby={`faq-q-${q}`}
                      className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden">
                        <p
                          className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed pb-5 pr-10 text-pretty max-w-[62ch]"
                          dangerouslySetInnerHTML={{ __html: t(lang, a) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-foreground/15" />
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
