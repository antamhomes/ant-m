import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/**
 * Ceník: všechno, co může majitel zaplatit, na jednom místě a s cenou.
 * Existuje proto, že "žádné vstupní poplatky" přestalo platit ve chvíli,
 * kdy má Uvedení do provozu svou cenu. Radši to říct dřív než na schůzce.
 *
 * AD 2. 9. 2026: sazba je největší číslo v sekci a nestojí v kartě. Cenu
 * neschováváme, tak ji ani vizuálně nebalíme. Rámečky, vyplněné pozadí
 * a pruh 70/30 šly pryč: ten pruh nic neměřil, jen dekoroval poměr, který
 * je o dva řádky níž vypsaný v korunách.
 */
type Row = { k: "pr6" | "pr7" };

/** Co je v odměně navíc: garance a krytí škod stojí hned pod sazbou. */
const CORE_ROWS: Row[] = [{ k: "pr6" }, { k: "pr7" }];

/** Jednorázové a doplňkové položky za rozbalovákem. */
const MORE_ROWS = ["pr2", "pr3", "pr4", "pr5", "pr8"] as const;

const PricingSection = () => {
  const { lang } = useLanguage();
  const flows = ([1, 2, 3, 4, 5] as const).filter((n) => t(lang, `pr1_flow${n}` as const));
  const stack = ([1, 2, 3, 4, 5, 6] as const).filter((n) => t(lang, `pr1_stack_${n}` as const));

  return (
    <section id="cenik" className="section-cont bg-secondary scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "pricing_label")}</p>
          <h2 className="h-section-xs text-foreground">{t(lang, "pricing_title")}</h2>
        </Reveal>

        <div className="grid gap-x-14 gap-y-9 lg:grid-cols-[auto_minmax(0,1fr)] items-start">
          <Reveal>
            <p className="tnum font-display font-semibold text-foreground leading-[0.82] tracking-[-0.048em] text-[clamp(6rem,12.5vw,10.75rem)]">
              30
              <span className="align-super text-[0.28em] tracking-normal text-gold-deep ml-[0.02em]">%</span>
            </p>
            <p className="mt-1 font-body text-[11px] sm:text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t(lang, "pr1_price_short")}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="font-body text-[17px] md:text-[19px] text-foreground leading-relaxed max-w-[46ch]">
              {t(lang, "pricing_desc")}
            </p>

            {/* Tok peněz ze vzorového vyúčtování. Bez rámečku: je to výpočet,
                který si má čtenář přepočítat, ne kartička. */}
            <dl className="mt-7 border-t border-foreground/25">
              {flows.map((n) => {
                const owner = n === 4;
                return (
                  <div
                    key={n}
                    className={`flex items-baseline justify-between gap-6 py-3.5 tnum ${
                      owner ? "border-y border-foreground/25" : "border-b border-border"
                    }`}
                  >
                    <dt className={`font-body text-[14.5px] sm:text-[15px] ${owner ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {t(lang, `pr1_flow${n}` as const)}
                    </dt>
                    <dd
                      className={`m-0 whitespace-nowrap font-display ${
                        owner ? "text-[26px] sm:text-[30px] font-semibold text-gold-deep" : "text-[19px] sm:text-[21px] text-foreground/80"
                      }`}
                    >
                      {t(lang, `pr1_flow${n}_v` as const)}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {t(lang, "pr1_flow_note") && (
              <p className="mt-4 font-body text-[14.5px] text-foreground leading-relaxed max-w-[62ch]">
                {t(lang, "pr1_flow_note")}
              </p>
            )}

            {t(lang, "pr1_stack_title") && (
              <div className="mt-7">
                <p className="font-body text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {t(lang, "pr1_stack_title")}
                </p>
                <ul className="mt-2.5 space-y-1">
                  {stack.map((n) => (
                    <li key={n} className="flex items-baseline gap-2.5 font-body text-[14.5px] text-muted-foreground">
                      <span aria-hidden="true" className="text-gold-deep">·</span>
                      <span>{t(lang, `pr1_stack_${n}` as const)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-5 font-body text-[14.5px] text-muted-foreground leading-relaxed max-w-[62ch]">
              {t(lang, "pr1_note")}
            </p>

            {/* Garance a krytí škod: jediné místo, kde je vidět, co je v těch 30 % navíc. */}
            <dl className="mt-8 border-t border-border">
              {CORE_ROWS.map(({ k }) => (
                <div key={k} className="border-b border-border py-4">
                  <dt className="font-display text-[17px] text-foreground">
                    {t(lang, `${k}_name` as const)}
                    <span className="ml-2 font-body text-[13px] text-muted-foreground">{t(lang, `${k}_price` as const)}</span>
                  </dt>
                  <dd className="m-0 mt-1 font-body text-[14.5px] text-muted-foreground leading-relaxed max-w-[62ch]">
                    {t(lang, `${k}_note` as const)}
                  </dd>
                </div>
              ))}
            </dl>

            <details className="group mt-5">
              <summary className="list-none cursor-pointer font-body text-sm text-gold-deep underline underline-offset-4 decoration-gold/40 [&::-webkit-details-marker]:hidden">
                {t(lang, "pricing_more")}
              </summary>
              <dl className="mt-4 border-t border-border">
                {MORE_ROWS.map((k) => (
                  <div key={k} className="border-b border-border py-4">
                    <dt className="font-display text-[16px] text-foreground">
                      {t(lang, `${k}_name` as const)}
                      <span className="ml-2 font-body text-[13px] text-muted-foreground tnum">{t(lang, `${k}_price` as const)}</span>
                    </dt>
                    <dd className="m-0 mt-1 font-body text-[14px] text-muted-foreground leading-relaxed max-w-[62ch]">
                      {t(lang, `${k}_note` as const)}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>

            {/* „Proč 30 %?" — jediná námitka, kterou tahle sekce sama vyvolá,
                tak ať na ni odpoví na místě, ne až na schůzce. (2B: z faq17.) */}
            <div className="mt-10 pt-7 border-t border-border">
              <p className="font-display text-[1.15rem] md:text-[1.3rem] font-semibold text-foreground mb-2">
                {t(lang, "faq17_q")}
              </p>
              <p className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed text-pretty max-w-[62ch]">
                {t(lang, "faq17_a")}
              </p>
            </div>

            <p className="mt-6 font-body text-[13px] text-muted-foreground leading-relaxed text-pretty max-w-[68ch]">
              {t(lang, "pricing_foot")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
