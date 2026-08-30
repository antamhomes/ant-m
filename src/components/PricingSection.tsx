import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/**
 * Ceník: všechno, co může majitel zaplatit, na jednom místě a s cenou.
 * Existuje proto, že "žádné vstupní poplatky" přestalo platit ve chvíli,
 * kdy má Uvedení do provozu svou cenu. Radši to říct dřív než na schůzce.
 */
type Row = { k: "pr1" | "pr6" | "pr7" | "pr2" | "pr3" | "pr4" | "pr5" | "pr8"; accent?: boolean };

/** Jádro ekonomiky zůstává vidět: odměna 30 %, garance a krytí škod. */
const CORE_ROWS: Row[] = [
  { k: "pr1", accent: true },
  // Garance a krytí škod hned pod odměnou: jediné místo v ceníku, kde je vidět,
  // co je v těch 30 % navíc. Obojí je v odměně, proto stojí vedle sebe.
  { k: "pr6" },
  { k: "pr7" },
];
/** Jednorázové a doplňkové položky za rozbalovákem. */
const MORE_ROWS: Row[] = [
  { k: "pr2" },
  { k: "pr3" },
  { k: "pr4" },
  { k: "pr5" },
  { k: "pr8" },
];

const PricingSection = () => {
  const { lang } = useLanguage();
  return (
    <section id="cenik" className="section bg-secondary scroll-mt-16">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "pricing_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "pricing_title")}</h2>
          <p className="lead">{t(lang, "pricing_desc")}</p>
        </Reveal>

        <Reveal as="dl" delay={0.1} className="border border-border rounded-md overflow-hidden bg-card">
          {CORE_ROWS.map(({ k, accent }, i) => (
            <div
              key={k}
              className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 px-5 py-4 ${
                i ? "border-t border-border" : ""
              }`}
            >
              <dt className="sm:w-[38%] shrink-0">
                <span className={`font-display text-[17px] ${accent ? "text-gold-deep font-semibold" : "text-foreground"}`}>
                  {t(lang, `${k}_name` as const)}
                </span>
                <span className="block font-body text-[15px] text-foreground mt-0.5 tnum">
                  {t(lang, `${k}_price` as const)}
                </span>
              </dt>
              <dd className="font-body text-[14.5px] text-muted-foreground leading-relaxed m-0">
                {/* První řádek nevysvětluje definici, ale ukazuje tok peněz: zastávky ze vzorového
                   vyúčtování; řádek s prázdným textem se přeskočí (CZ má čtyři, VI pět). */}
                {k === "pr1" && (
                  <span className="block mb-3 max-w-sm rounded-sm border border-border bg-muted/40 px-3.5 py-1 tnum">
                    {([1, 2, 3, 4, 5] as const).filter((n) => t(lang, `pr1_flow${n}` as const)).map((n) => (
                      <span
                        key={n}
                        className={`flex items-baseline justify-between gap-4 py-1.5 ${n > 1 ? "border-t border-border/70" : ""}`}
                      >
                        <span className={n === 4 ? "text-foreground" : ""}>{t(lang, `pr1_flow${n}` as const)}</span>
                        <span className={`whitespace-nowrap font-semibold ${n === 4 ? "text-gold-deep" : "text-foreground/80"}`}>
                          {t(lang, `pr1_flow${n}_v` as const)}
                        </span>
                      </span>
                    ))}
                  </span>
                )}
                {k === "pr1" && t(lang, "pr1_flow_note") && (
                  <span className="block mb-3 font-body text-[14.5px] text-foreground">
                    {t(lang, "pr1_flow_note")}
                  </span>
                )}
                {/* Hodnotový stack: co je v odměně, s tržní cenou tam, kde má veřejný
                   zdroj (PriceLabs ceník, ceníky fotografů). Bez vymyšlených čísel. */}
                {k === "pr1" && t(lang, "pr1_stack_title") && (
                  <span className="block mb-3">
                    <span className="block font-body text-[13px] uppercase tracking-wide text-muted-foreground mb-1.5">
                      {t(lang, "pr1_stack_title")}
                    </span>
                    <span className="block max-w-sm">
                      {([1, 2, 3, 4, 5, 6] as const).filter((n) => t(lang, `pr1_stack_${n}` as const)).map((n) => (
                        <span key={n} className="flex items-baseline gap-2 py-0.5">
                          <span aria-hidden="true" className="text-gold-deep">·</span>
                          <span>{t(lang, `pr1_stack_${n}` as const)}</span>
                        </span>
                      ))}
                    </span>
                  </span>
                )}
                {t(lang, `${k}_note` as const)}
                {/* The 70/30 split, shown where the fee is defined (former PriceStrip). */}
                {k === "pr1" && (
                  <span className="block mt-3" aria-label={t(lang, "calc_split_aria") as string}>
                    <span className="flex h-2 w-full max-w-sm overflow-hidden rounded-full bg-muted">
                      <span className="block h-full w-[70%] bg-gold" />
                      <span className="block h-full w-[30%] bg-charcoal/25" />
                    </span>
                    <span className="mt-1.5 flex max-w-sm items-baseline justify-between font-body text-[13px] tnum">
                      <strong className="font-semibold text-gold-deep">{t(lang, "pr1_split_owner")}</strong>
                      <span className="text-muted-foreground">{t(lang, "pr1_split_fee")}</span>
                    </span>
                  </span>
                )}
              </dd>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.12} className="mt-4">
          <details className="group">
            <summary className="list-none cursor-pointer font-body text-sm text-gold-deep underline underline-offset-4 decoration-gold/40 [&::-webkit-details-marker]:hidden">
              {t(lang, "pricing_more")}
            </summary>
            <dl className="mt-4 border border-border rounded-md overflow-hidden bg-card">
              {MORE_ROWS.map(({ k }, i) => (
                <div
                  key={k}
                  className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 px-5 py-4 ${
                    i ? "border-t border-border" : ""
                  }`}
                >
                  <dt className="sm:w-[38%] shrink-0">
                    <span className="font-display text-[17px] text-foreground">{t(lang, `${k}_name` as const)}</span>
                    <span className="block font-body text-[15px] text-foreground mt-0.5 tnum">
                      {t(lang, `${k}_price` as const)}
                    </span>
                  </dt>
                  <dd className="font-body text-[14.5px] text-muted-foreground leading-relaxed m-0">
                    {t(lang, `${k}_note` as const)}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="font-body text-[13px] text-muted-foreground leading-relaxed mt-4 text-pretty">
            {t(lang, "pricing_foot")}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default PricingSection;
