import { ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { pathFor, sectionHref } from "@/lib/pages";

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
 * protože to je ta volba: procento každý měsíc, nebo částka jednou.
 *
 * 2. 11. 2026 (tři stránky): jedna komponenta, tři podoby.
 *  - "both"    homepage: diptych, tlačítka vedou na podstránky, přestavba jako řádek;
 *  - "managed" /sprava: jen tmavý panel přes celou šířku, tlačítko do formuláře,
 *                       v rozbalovači jen položky správy;
 *  - "own"     /vlastni-provoz: jen světlý panel, most na #system, přestavba.
 * Garance a krytí škod jsou řádky správy (pr6 nese kotvu #garance, "pr6", "pr7").
 */
export type PricingVariant = "both" | "managed" | "own";

/** Jednorázové a doplňkové položky za rozbalovákem, podle stránky. */
const MORE_ROWS: Record<PricingVariant, readonly TranslationKey[]> = {
  both: ["pr2", "pr3", "pr4", "pr9", "pr5", "pr8"].map((k) => k as TranslationKey),
  managed: ["pr2", "pr3", "pr5", "pr8"].map((k) => k as TranslationKey),
  own: ["pr4", "pr3", "pr9"].map((k) => k as TranslationKey),
};

type Row = { name: TranslationKey; value: TranslationKey; id?: string };

/** Řádky správy: váš čas, příprava, vybavení, garance (kotva #garance), krytí škod, závazek. */
const US_ROWS: Row[] = [
  { name: "pr_time_name", value: "pr1_time_value" },
  { name: "pr1_setup_name", value: "pr1_setup_price" },
  { name: "pr1_furnish_name", value: "pr1_furnish_value" },
  { name: "pr6_name", value: "pr6_price", id: "garance" },
  { name: "pr7_name", value: "pr7_price" },
  { name: "pr1_term_name", value: "pr1_term_value" },
];

/** Řádky vlastního provozu: vybavení + 20 %, řízení cen, předání, 90 dní. */
const SELF_ROWS: Row[] = [
  { name: "pr_time_name", value: "pr4_time_value" },
  { name: "pr1_furnish_name", value: "pr4_furnish_value" },
  { name: "pr4_row2_name", value: "pr4_row2_value" },
  { name: "pr4_row3_name", value: "pr4_row3_value" },
  { name: "pr4_row4_name", value: "pr4_row4_value" },
];

const PricingSection = ({ variant = "both" }: { variant?: PricingVariant }) => {
  const { lang, page } = useLanguage();
  const single = variant !== "both";

  const rows = (list: Row[], dark: boolean) => (
    <dl className={`mt-8 md:mt-9 m-0 border-t ${dark ? "border-[#C2A46D]/35" : "border-foreground/15"}`}>
      {list.map((r) => (
        <div
          key={r.name}
          id={r.id}
          className={`grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 py-3.5 border-b ${dark ? "border-[#C2A46D]/25" : "border-foreground/15"} ${r.id ? "scroll-mt-28" : ""}`}
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

  // Na homepage vede tlačítko panelu na jeho stránku; na stránce do formuláře.
  const managedHref = single ? "#kontakt" : pathFor("sprava", lang);
  const ownHref = single ? "#kontakt" : pathFor("vlastni-provoz", lang);
  const heading: TranslationKey = variant === "managed" ? "pricing_h2_managed" : variant === "own" ? "pricing_h2_own" : "pricing_h2";
  const note: TranslationKey = variant === "managed" ? "path_note_managed" : variant === "own" ? "path_note_own" : "path_note";
  // Jeden panel přes celou šířku: číslo vlevo, řádky vpravo.
  const panelLayout = single ? "lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-14" : "flex flex-col";

  const managedPanel = (
    <article className={`rounded-sm bg-primary text-primary-foreground px-6 py-8 md:px-10 md:py-11 ${panelLayout}`}>
      <div className={single ? "flex flex-col" : ""}>
        <h3 className="m-0 font-body text-[26px] md:text-[30px] font-medium leading-tight">
          {t(lang, "path_us_t")}
        </h3>
        <p className="mt-7 md:mt-9 mb-0 font-display font-medium leading-[0.85] tracking-[-0.03em] tnum text-[clamp(4.5rem,9vw,7rem)]">
          20<span className="text-[0.42em] font-normal text-gold align-baseline">{lang === "cs" ? " " : ""}%</span>
          <span className="block mt-3 md:inline md:mt-0 md:ml-3 align-baseline font-body font-normal tracking-normal text-[0.2em] text-white/70">{t(lang, "pr1_vat_tag")}</span>
        </p>
        <p className="mt-4 mb-0 font-body text-[15px] md:text-[16px] leading-relaxed text-white/80 max-w-[40ch] text-pretty">
          {t(lang, "pr1_basis")}
        </p>
        {single && (
          <a
            href={managedHref}
            onClick={() => trackEvent("cta_click", { location: "pricing", target: "contact" })}
            className="hidden lg:inline-flex btn btn-primary-inverse mt-auto pt-0 self-start !py-[1rem] !px-8 !text-[13.5px] lg:!mt-10"
          >
            {t(lang, "g_cta")}
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>
      <div>
        {rows(US_ROWS, true)}
        <p className="mt-4 mb-0 font-body text-[13px] leading-relaxed text-white/60 max-w-[52ch]">
          {t(lang, "pr1_incl_items")}
        </p>
        <a
          href={managedHref}
          onClick={() => trackEvent("cta_click", { location: "pricing", target: single ? "contact" : "page-sprava" })}
          className={`${single ? "lg:hidden " : ""}btn btn-primary-inverse mt-8 md:mt-9 self-start !py-[1rem] !px-5 sm:!px-8 !text-[12.5px] sm:!text-[13.5px]`}
        >
          {t(lang, single ? "g_cta" : "pr1_page_cta")}
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </article>
  );

  const ownPanel = (
    <article className={`rounded-sm bg-card border border-border px-6 py-8 md:px-10 md:py-11 ${panelLayout}`}>
      <div className={single ? "flex flex-col" : ""}>
        <h3 className="m-0 font-body text-[26px] md:text-[30px] font-medium leading-tight text-foreground">
          {t(lang, "path_self_t")}
        </h3>
        <p className="mt-7 md:mt-9 mb-0 font-display font-medium leading-[0.85] tracking-[-0.03em] tnum text-foreground text-[clamp(2.5rem,9.5vw,4.9rem)]">
          <span className="sm:whitespace-nowrap">{"270\u00a0000"}<span className="text-[0.42em] font-normal text-gold-deep align-baseline"> Kč</span></span>
          <span className="block mt-3 font-body font-normal tracking-normal text-[0.29em] text-muted-foreground whitespace-nowrap">{t(lang, "pr4_big_tag")}</span>
        </p>
        <p className="mt-4 mb-0 font-body text-[15px] md:text-[16px] leading-relaxed text-muted-foreground max-w-[40ch] text-pretty">
          {t(lang, "pr4_basis")}
        </p>
        {single && (
          <a
            href={ownHref}
            onClick={() => trackEvent("cta_click", { location: "pricing", target: "own" })}
            className="hidden lg:inline-flex btn btn-secondary mt-auto self-start !py-[1rem] !px-8 !text-[13.5px] lg:!mt-10"
          >
            {t(lang, "pr4_cta")}
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>
      <div>
        {rows(SELF_ROWS, false)}
        {/* Most k sekci Provozní systém (2. 11. 2026): místo seznamu úkonů jedna
            věta s odkazem, ať se 270 000 spojí s tím, co za to je. Z homepage
            vede na podstránku, tam je to kotva. */}
        <a href={sectionHref("system", page, lang)} className="mt-4 mb-0 inline-block font-body text-[13.5px] leading-relaxed text-gold-deep underline underline-offset-4 decoration-gold/40 max-w-[52ch]">
          {t(lang, "pr4_system_link")}
        </a>
        <a
          href={ownHref}
          onClick={() => trackEvent("cta_click", { location: "pricing", target: single ? "own" : "page-own" })}
          className={`${single ? "lg:hidden " : ""}btn btn-secondary mt-8 md:mt-9 self-start !py-[1rem] !px-5 sm:!px-8 !text-[12.5px] sm:!text-[13.5px] block w-fit`}
        >
          {t(lang, single ? "pr4_cta" : "pr4_page_cta")}
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </article>
  );

  return (
    <section id="cenik" className="section-cont chapter-edge bg-secondary scroll-mt-20">
      <div className="container-wide">
        <Reveal className="mb-8 md:mb-12">
          <h2 className="h-section-sm text-foreground">{t(lang, heading)}</h2>
        </Reveal>

        <Reveal delay={0.05}>
          {variant === "both" && (
            <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
              {managedPanel}
              {ownPanel}
            </div>
          )}
          {variant === "managed" && managedPanel}
          {variant === "own" && ownPanel}

          {/* PŘESTAVBA: jeden řádek pro ty, kdo už pronajímají (homepage a vlastní provoz). */}
          {variant !== "managed" && (
            <div id={variant === "own" ? "prestavba" : undefined} className="mt-5 md:mt-6 rounded-sm border border-border bg-card px-6 py-5 md:px-10 md:py-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 scroll-mt-28">
              <div className="min-w-0">
                <p className="m-0 font-body text-[19px] md:text-[21px] font-medium text-foreground leading-snug">
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
          )}

          <p className="mt-4 mb-0 font-body text-[13px] text-muted-foreground">{t(lang, note)}</p>

          {/* PODROBNÝ CENÍK: jen název a cena na lince, žádné odstavce.
              pr1_setup_name stojí v panelu výš, viditelný bez rozbalení <details>. */}
          <details className="group mt-7 md:mt-9">
            <summary className="list-none cursor-pointer font-body text-sm text-gold-deep underline underline-offset-4 decoration-gold/40 [&::-webkit-details-marker]:hidden">
              {t(lang, variant === "managed" ? "pricing_more_managed" : variant === "own" ? "pricing_more_own" : "pricing_more")}
            </summary>
            <dl className="mt-5 m-0 border-t border-foreground/15 max-w-[72ch]">
              {MORE_ROWS[variant].map((k) => (
                <div key={k} className="grid sm:grid-cols-[1fr_auto] gap-x-8 gap-y-0.5 py-3.5 border-b border-foreground/15">
                  <dt className="m-0 font-body text-[15px] text-foreground leading-snug">{t(lang, `${k}_name` as TranslationKey)}</dt>
                  <dd className="m-0 font-body tnum text-[15px] text-foreground/80 leading-snug sm:text-right">{t(lang, ((k as string) === "pr3" && variant !== "both" ? `pr3_price_${variant}` : `${k}_price`) as TranslationKey)}</dd>
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
