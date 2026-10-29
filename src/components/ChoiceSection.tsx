import { ChevronRight } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * VOLBA (29. 10. 2026, dodatky 2 a 3: „Vybudujeme systém. Vy si vyberete, kdo
 * ho provozuje."). Stojí hned pod hero, před důkazy: návštěvník má dvě otázky
 * (začínám, nebo už pronajímám? chci to provozovat, nebo ne?) a z nich mu
 * vyjede jedna ze tří věcí, které umíme. Ceník, kalkulačka, Revenue OS a
 * přestavba jsou vnitřní architektura, sem patří jen volba.
 *
 * Všechny čtyři karty vedou na formulář; sekce nic nepočítá, jen třídí.
 */
type Cell = { t: TranslationKey; d: TranslationKey; target: string };
const ROWS: { label: TranslationKey; self: Cell; us: Cell }[] = [
  {
    label: "choice_row_new",
    self: { t: "choice_new_self_t", d: "choice_new_self_d", target: "own" },
    us: { t: "choice_new_us_t", d: "choice_new_us_d", target: "managed" },
  },
  {
    label: "choice_row_live",
    self: { t: "choice_live_self_t", d: "choice_live_self_d", target: "rebuild" },
    us: { t: "choice_live_us_t", d: "choice_live_us_d", target: "managed" },
  },
];

const ChoiceSection = () => {
  const { lang } = useLanguage();

  const card = (c: Cell, i: number) => (
    <Reveal key={c.t} delay={stagger(i, 0.05)}>
      <a
        href="#kontakt"
        onClick={() => trackEvent("cta_click", { location: "choice", target: c.target })}
        className="group block rounded-sm border border-border bg-card px-5 py-5 md:px-6 md:py-6 transition-colors hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        <p className="m-0 font-display text-[19px] md:text-[21px] font-semibold text-foreground leading-snug">
          {t(lang, c.t)}
        </p>
        <p className="mt-2 mb-0 font-body text-[14.5px] md:text-[15px] text-muted-foreground leading-relaxed text-pretty">
          {t(lang, c.d)}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 font-body text-[12px] uppercase tracking-[0.14em] text-gold-deep">
          {t(lang, "nav_freeConsultation")}
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </a>
    </Reveal>
  );

  return (
    <section id="volba" className="section bg-background scroll-mt-20">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "choice_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "choice_title")}</h2>
        </Reveal>

        {/* Desktop: mřížka 2×2 s popisky sloupců a řádků. Mobil: řádky pod sebou,
            každý s popiskem a dvěma kartami; popisky sloupců se opakují u karet
            jako malé návěští, ať čtenář neztratí, která strana je „sám". */}
        <Reveal delay={0.05}>
          <div className="hidden md:grid md:grid-cols-[minmax(0,0.7fr)_1fr_1fr] gap-x-6 pb-3">
            <span />
            <span className="font-body text-xs uppercase tracking-[0.14em] text-gold-deep">{t(lang, "choice_col_self")}</span>
            <span className="font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">{t(lang, "choice_col_us")}</span>
          </div>
          <div className="grid gap-y-8 md:gap-y-5">
            {ROWS.map((r, ri) => (
              <div key={r.label} className="grid md:grid-cols-[minmax(0,0.7fr)_1fr_1fr] gap-x-6 gap-y-3 items-start">
                <p className="m-0 font-display text-[17px] md:text-[1.05rem] font-semibold text-foreground md:pt-5">
                  {t(lang, r.label)}
                </p>
                <div>
                  <span className="md:hidden block font-body text-[11px] uppercase tracking-[0.12em] text-gold-deep mb-1.5">{t(lang, "choice_col_self")}</span>
                  {card(r.self, ri * 2)}
                </div>
                <div>
                  <span className="md:hidden block font-body text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">{t(lang, "choice_col_us")}</span>
                  {card(r.us, ri * 2 + 1)}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12} className="mt-9 md:mt-12 max-w-prose">
          <p className="font-body text-[15px] md:text-[16px] text-muted-foreground leading-relaxed text-pretty">
            {t(lang, "choice_note")}
          </p>
          <a
            href="#kontakt"
            onClick={() => trackEvent("cta_click", { location: "choice", target: "contact" })}
            className="btn btn-primary mt-6 !py-[1.05rem] !px-6 sm:!px-9 !text-[13.5px]"
          >
            {t(lang, "choice_cta")}
            <ChevronRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default ChoiceSection;
