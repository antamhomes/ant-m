import { ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * VOLBA (29. 10. 2026, dodatky 2 a 3: „Vybudujeme systém. Vy si vyberete, kdo
 * ho provozuje."). Stojí hned pod hero, před důkazy: sekce nic nepočítá, jen
 * třídí návštěvníka na jednu ze dvou cest.
 *
 * 29. 10. 2026 odpoledne (zadání V.: „stejná idea jako ceník"): místo mřížky
 * 2×2 se dvěma osami popisků jsou to DVA PANELY ve stejné řeči jako ceník.
 * Tmavý „Provozujeme za vás" vlevo, světlý „Provozuji sám" vpravo; uvnitř
 * každého dva řádky podle stavu bytu (prázdný nebo nový / už pronajímám).
 * Panely nenesou odkaz, pod nimi je jedna věta a jedno tlačítko.
 */
type Line = { label: TranslationKey; text: TranslationKey };
type Panel = { title: TranslationKey; sub: TranslationKey; lines: Line[]; dark: boolean };

const PANELS: Panel[] = [
  {
    title: "choice_new_us_t",
    sub: "choice_col_us",
    dark: true,
    lines: [
      { label: "choice_row_new", text: "choice_new_us_d" },
      { label: "choice_row_live", text: "choice_live_us_d" },
    ],
  },
  {
    title: "choice_new_self_t",
    sub: "choice_col_self",
    dark: false,
    lines: [
      { label: "choice_row_new", text: "choice_new_self_d" },
      { label: "choice_row_live", text: "choice_live_self_d" },
    ],
  },
];

const ChoiceSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="volba" className="section bg-background scroll-mt-20">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "choice_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "choice_title")}</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
            {PANELS.map((p) => (
              <article
                key={p.title}
                className={`rounded-sm px-6 py-8 md:px-10 md:py-10 ${p.dark ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}
              >
                <h3 className="m-0 font-display text-[26px] md:text-[30px] font-semibold leading-tight">
                  {t(lang, p.title)}
                </h3>
                <p className={`mt-2 mb-0 font-body text-[14px] ${p.dark ? "text-white/65" : "text-muted-foreground"}`}>
                  {t(lang, p.sub)}
                </p>
                <dl className={`mt-7 md:mt-8 m-0 border-t ${p.dark ? "border-white/15" : "border-foreground/15"}`}>
                  {p.lines.map((l) => (
                    <div key={l.label} className={`py-4 md:py-5 border-b ${p.dark ? "border-white/15" : "border-foreground/15"}`}>
                      <dt className={`m-0 font-body text-[12px] uppercase tracking-[0.14em] ${p.dark ? "text-gold" : "text-gold-deep"}`}>
                        {t(lang, l.label)}
                      </dt>
                      <dd className={`m-0 mt-1.5 font-display text-[19px] md:text-[21px] leading-snug text-pretty ${p.dark ? "text-white" : "text-foreground"}`}>
                        {t(lang, l.text)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
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
