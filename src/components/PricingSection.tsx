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
    <section id="cenik" className="section-cont chapter-edge bg-secondary scroll-mt-20">
      <div className="container-wide">
        {/* AD 2. 9. 2026: model, ne obhajoba, ale ani slogan. „70 % vám,
            30 % nám" v nadpisu znělo jako dělení kořisti vedle vážného zbytku
            stránky. Nadpis je obyčejný, dělení řeknou dvě věty a závěr si
            čtenář udělá z výpočtu pod nimi. */}
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "pricing_label")}</p>
          {/* Nadpisem je rovnou ta věta o dělení. Samostatné "Naše odměna"
              nad ní bylo menší než ona, takže hierarchie šla obráceně a sekce
              působila nedodělaně. Eyebrow "Ceník" štítek stejně nese. */}
          <h2 className="h-section-xs text-foreground tnum text-balance max-w-[22ch]">
            {t(lang, "pricing_split1")}
          </h2>
        </Reveal>

        <div className="max-w-3xl">
          <Reveal delay={0.05}>
            <p className="font-display text-muted-foreground leading-[1.35] text-[clamp(1.1rem,1.6vw,1.35rem)] text-balance tnum">
              {t(lang, "pricing_split2")}
            </p>
            <p className="mt-5 font-body text-[15.5px] md:text-base text-muted-foreground leading-relaxed max-w-[58ch]">
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

            {/* Garance a krytí škod: jediné místo, kde je vidět, co je v těch 30 % navíc.
                AD 2. 9. 2026: o stupeň víc váhy. Jsou to dvě podstatné podmínky
                obchodu, ale mezi ostatními poznámkami se četly jako další řádek
                textu. Víc vzduchu, silnější serif v názvu a „v odměně" vpravo
                jako u řádků toku peněz výš: stejná gramatika, žádná nová karta. */}
            <dl className="mt-12 md:mt-14 border-t border-foreground/25">
              {CORE_ROWS.map(({ k }) => (
                <div key={k} className="border-b border-border py-6 md:py-7">
                  <dt className="flex items-baseline justify-between gap-6">
                    <span className="font-display text-[20px] md:text-[22px] font-semibold text-foreground leading-snug">
                      {t(lang, `${k}_name` as const)}
                    </span>
                    <span className="shrink-0 font-body text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
                      {t(lang, `${k}_price` as const)}
                    </span>
                  </dt>
                  <dd className="m-0 mt-2 font-body text-[14.5px] text-muted-foreground leading-relaxed max-w-[62ch]">
                    {t(lang, `${k}_note` as const)}
                  </dd>
                </div>
              ))}
            </dl>

            <details className="group mt-7">
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

            <p className="mt-10 pt-7 border-t border-border font-body text-[13px] text-muted-foreground leading-relaxed text-pretty max-w-[68ch]">
              {t(lang, "pricing_foot")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
