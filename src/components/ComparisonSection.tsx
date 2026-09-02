import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/**
 * SROVNÁNÍ S DLOUHODOBÝM NÁJMEM (obnoveno 2B).
 *
 * Kopie pro tuhle sekci (comp1–comp4, longTerm_label, shortTerm_label,
 * whyBetter_desc) v repu celou dobu byla, ale nerenderovala se nikde. Sekce
 * stojí mezi kalkulačkou a ceníkem, protože po vlastním čísle nepřijde jako
 * první otázka „kolik si berete", ale námitka „nájem je jednodušší".
 *
 * Pořadí uvnitř je schválně: nejdřív se přizná silná stránka nájmu
 * (whyBetter_desc), teprve pak jde srovnání. Sekce se zavírá poctivým
 * odmítnutím (faq13): pro koho krátkodobý pronájem nedává smysl. Ta věta se
 * do 2B nikde nezobrazovala.
 */
const rows = [
  { title: "comp1_title", long: "comp1_long", short: "comp1_short" },
  { title: "comp2_title", long: "comp2_long", short: "comp2_short" },
  { title: "comp3_title", long: "comp3_long", short: "comp3_short" },
  { title: "comp4_title", long: "comp4_long", short: "comp4_short" },
] as const;

const ComparisonSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="srovnani" className="section chapter-edge bg-background scroll-mt-20">
      <div className="container-wide">
        <div className="max-w-[56rem]">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "cmp_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "cmp_title")}</h2>
          <p className="lead">{t(lang, "whyBetter_desc")}</p>
        </Reveal>

        {/* Ledger: na mobilu dva sloupce pod sebou v jednom řádku, na desktopu
            tři sloupce. Žádné ikony ani odškrtávátka: je to srovnání, ne
            tabulka funkcí. */}
        <Reveal delay={0.05} className="border-t border-border">
          <div
            aria-hidden="true"
            className="hidden md:grid md:grid-cols-[1fr_1fr_1fr] gap-x-8 px-1 pt-4 pb-3"
          >
            <span />
            <span className="font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t(lang, "longTerm_label")}
            </span>
            <span className="font-body text-xs uppercase tracking-[0.14em] text-gold-deep">
              {t(lang, "shortTerm_label")}
            </span>
          </div>

          <dl className="m-0">
            {rows.map((r, i) => (
              <Reveal
                as="div"
                key={r.title}
                delay={stagger(i, 0.05)}
                className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1fr] gap-x-6 md:gap-x-8 gap-y-1 py-4 md:py-5 border-t border-border first:border-t-0 md:first:border-t"
              >
                <dt className="col-span-2 md:col-span-1 font-display text-[17px] md:text-[1.05rem] font-semibold text-foreground mb-1 md:mb-0">
                  {t(lang, r.title)}
                </dt>
                <dd className="m-0">
                  <span className="md:hidden block font-body text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-1">
                    {t(lang, "longTerm_label")}
                  </span>
                  <span className="font-body text-[14.5px] md:text-[15px] text-muted-foreground leading-relaxed text-pretty">
                    {t(lang, r.long)}
                  </span>
                </dd>
                <dd className="m-0">
                  <span className="md:hidden block font-body text-[11px] uppercase tracking-[0.12em] text-gold-deep mb-1">
                    {t(lang, "shortTerm_label")}
                  </span>
                  <span className="font-body text-[14.5px] md:text-[15px] text-foreground leading-relaxed text-pretty">
                    {t(lang, r.short)}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </Reveal>

        {/* Dobrovolné odmítnutí. Stojí schválně na konci sekce a schválně
            potichu: není to námitka, kterou má web překonat, ale kvalifikace. */}
        <Reveal delay={0.15} className="mt-8 md:mt-10 max-w-prose">
          <p className="font-display text-[17px] md:text-[1.05rem] font-semibold text-foreground mb-1.5">
            {t(lang, "faq13_q")}
          </p>
          <p className="font-body text-[14.5px] md:text-[15px] text-muted-foreground leading-relaxed text-pretty">
            {t(lang, "faq13_a")}
          </p>
        </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
