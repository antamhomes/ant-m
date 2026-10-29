import { ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * Ceník: všechno, co může majitel zaplatit, na jednom místě a s cenou.
 * Existuje proto, že "žádné vstupní poplatky" přestalo platit ve chvíli,
 * kdy má Uvedení do provozu svou cenu. Radši to říct dřív než na schůzce.
 *
 * PATCH 2 (7. 9. 2026, spec §1/§6): sem se sloučila samostatná sekce Garance.
 * Kotva #garance zůstává a vede na benefit níž.
 *
 * 29. 10. 2026 (zadání V.: „dvě nabídky, pořádně oddělené"): sekce je DIPTYCH.
 * Dva stejně široké panely proti sobě: tmavý „Provozujeme za vás" s číslem
 * 20 %, světlý „Provozuji sám" s číslem 270 000 Kč. Čísla stojí proti sobě,
 * protože to je ta volba: procento každý měsíc, nebo částka jednou. Každý
 * panel nese jednu větu o základu, čtyři řádky faktů a jedno tlačítko.
 * Garance a krytí škod jsou řádky správy (tam patří, pr6 nese kotvu
 * #garance). Přestavba běžícího bytu je jeden tenký řádek pod oběma panely.
 * Podrobný ceník zůstává jako rozbalovák, nic jiného v sekci není.
 */

/** Jednorázové a doplňkové položky za rozbalovákem. */
const MORE_ROWS = ["pr2", "pr3", "pr4", "pr9", "pr5", "pr8"] as const;

type Row = { name: TranslationKey; value: TranslationKey; id?: string };

/** Řádky správy: váš čas (29. 10. 2026: jediná měna, ve které se obě cesty opravdu liší), příprava, garance (kotva #garance, "pr6"), krytí škod ("pr7"), závazek. */
const US_ROWS: Row[] = [
  { name: "pr_time_name", value: "pr1_time_value" },
  { name: "pr1_setup_name", value: "pr1_setup_price" },
  { name: "pr6_name", value: "pr6_price", id: "garance" },
  { name: "pr7_name", value: "pr7_price" },
  { name: "pr1_term_name", value: "pr1_term_value" },
];

/** Řádky vlastního provozu: zařízený byt, řízení cen, předání, stabilizace. */
const SELF_ROWS: Row[] = [
  { name: "pr_time_name", value: "pr4_time_value" },
  { name: "pr4_row1_name", value: "pr4_row1_value" },
  { name: "pr4_row2_name", value: "pr4_row2_value" },
  { name: "pr4_row3_name", value: "pr4_row3_value" },
  { name: "pr4_row4_name", value: "pr4_row4_value" },
];

const PricingSection = () => {
  const { lang } = useLanguage();

  const rows = (list: Row[], dark: boolean) => (
    <dl className={`mt-8 md:mt-9 m-0 border-t ${dark ? "border-white/15" : "border-foreground/15"}`}>
      {list.map((r) => (
        <div
          key={r.name}
          id={r.id}
          className={`grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 py-3.5 border-b ${dark ? "border-white/15" : "border-foreground/15"} ${r.id ? "scroll-mt-28" : ""}`}
        >
          <dt className={`m-0 font-body text-[15px] leading-snug ${dark ? "text-white" : "text-foreground"}`}>
            {t(lang, r.name)}
          </dt>
          <dd className={`m-0 font-body tnum text-[15px] leading-snug sm:text-right ${dark ? "text-white/80" : "text-foreground/80"}`}>
            {t(lang, r.value)}
          </dd>
        </div>
      ))}
    </dl>
  );

  return (
    <section id="cenik" className="section-cont chapter-edge bg-secondary scroll-mt-20">
      <div className="container-wide">
        <Reveal className="mb-8 md:mb-12">
          <p className="eyebrow eyebrow-center">{t(lang, "pricing_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "pricing_h2")}</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
            {/* SPRÁVA: tmavý panel, číslo 20 %. */}
            <article className="rounded-sm bg-primary text-primary-foreground px-6 py-8 md:px-10 md:py-11 flex flex-col">
              <h3 className="m-0 font-display text-[26px] md:text-[30px] font-semibold leading-tight">
                {t(lang, "path_us_t")}
              </h3>
              <p className="mt-7 md:mt-9 mb-0 font-display font-medium leading-[0.85] tracking-[-0.03em] tnum text-[clamp(4.5rem,9vw,7rem)]">
                20<span className="text-[0.42em] font-normal text-gold align-baseline">{lang === "cs" ? " " : ""}%</span>
                <span className="block mt-3 md:inline md:mt-0 md:ml-3 align-baseline font-body font-normal tracking-normal text-[0.2em] text-white/70">{t(lang, "pr1_vat_tag")}</span>
              </p>
              <p className="mt-4 mb-0 font-body text-[15px] md:text-[16px] leading-relaxed text-white/80 max-w-[40ch] text-pretty">
                {t(lang, "pr1_basis")}
              </p>
              {rows(US_ROWS, true)}
              <p className="mt-4 mb-0 font-body text-[13px] leading-relaxed text-white/60 max-w-[52ch]">
                {t(lang, "pr1_incl_items")}
              </p>
              <a
                href="#kontakt"
                onClick={() => trackEvent("cta_click", { location: "pricing", target: "contact" })}
                className="btn btn-primary-inverse mt-8 md:mt-9 self-start !py-[1rem] !px-5 sm:!px-8 !text-[12.5px] sm:!text-[13.5px]"
              >
                {t(lang, "g_cta")}
                <ChevronRight className="w-4 h-4" />
              </a>
            </article>

            {/* VLASTNÍ PROVOZ: světlý panel, číslo 270 000 Kč. */}
            <article className="rounded-sm bg-card border border-border px-6 py-8 md:px-10 md:py-11 flex flex-col">
              <h3 className="m-0 font-display text-[26px] md:text-[30px] font-semibold leading-tight text-foreground">
                {t(lang, "path_self_t")}
              </h3>
              <p className="mt-7 md:mt-9 mb-0 font-display font-medium leading-[0.85] tracking-[-0.03em] tnum text-foreground text-[clamp(3rem,6.2vw,4.9rem)]">
                270 000<span className="text-[0.42em] font-normal text-gold-deep align-baseline"> Kč</span>
                <span className="block mt-3 md:inline md:mt-0 md:ml-3 align-baseline font-body font-normal tracking-normal text-[0.29em] text-muted-foreground">{t(lang, "pr4_big_tag")}</span>
              </p>
              <p className="mt-4 mb-0 font-body text-[15px] md:text-[16px] leading-relaxed text-muted-foreground max-w-[40ch] text-pretty">
                {t(lang, "pr4_basis")}
              </p>
              {rows(SELF_ROWS, false)}
              <p className="mt-4 mb-0 font-body text-[13px] leading-relaxed text-muted-foreground max-w-[52ch]">
                {t(lang, "pr4_incl_items")}
              </p>
              <a
                href="#kontakt"
                onClick={() => trackEvent("cta_click", { location: "pricing", target: "own" })}
                className="btn btn-secondary mt-8 md:mt-9 self-start !py-[1rem] !px-5 sm:!px-8 !text-[12.5px] sm:!text-[13.5px]"
              >
                {t(lang, "pr4_cta")}
                <ChevronRight className="w-4 h-4" />
              </a>
            </article>
          </div>

          {/* PŘESTAVBA: jeden řádek pro ty, kdo už pronajímají. */}
          <div className="mt-5 md:mt-6 rounded-sm border border-border bg-card px-6 py-5 md:px-10 md:py-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <div className="min-w-0">
              <p className="m-0 font-display text-[19px] md:text-[21px] font-semibold text-foreground leading-snug">
                {t(lang, "pr9_name")}
              </p>
              <p className="mt-1 mb-0 font-body text-[14px] text-muted-foreground leading-relaxed max-w-[60ch] text-pretty">
                {t(lang, "pr9_short")}
              </p>
            </div>
            <p className="m-0 font-body tnum text-[15px] md:text-[16px] text-foreground whitespace-nowrap">
              {t(lang, "pr9_price")}
            </p>
          </div>

          <p className="mt-4 mb-0 font-body text-[13px] text-muted-foreground">{t(lang, "path_note")}</p>

          <details className="group mt-7 md:mt-9">
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
        </Reveal>
      </div>
    </section>
  );
};

export default PricingSection;
