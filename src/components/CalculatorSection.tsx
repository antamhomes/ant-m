import { useState, useMemo, useEffect } from "react";
import Reveal from "@/components/Reveal";
import { Calculator, MapPin, Home, Share2, Pencil, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { ROOMS, BAND_LABEL, SIZE_AREA, annualDamageCover, ownerMonthly, rentFor, type LocationKey, type SizeKey, type SeasonKey } from "@/lib/yield";
import { fiveYear } from "@/lib/horizon";
import { CALC_LOCATIONS as LOCATIONS, useCalc, type CalcLoc } from "@/contexts/CalcContext";

/** Lokalita v kalkulačce: pražské čtvrti + „jinde". U čtvrtí bez vlastních dat
 *  (P2, P6 až P10) a u „jinde" se panel výsledku přepne na posouzení
 *  do 24 hodin; ŽÁDNÉ číslo se neukazuje a nic se neopisuje z jiné čtvrti. */

// Dva vstupy (patch 139): lokalita, dispozice. Dispozice určuje pásmo trhu
// (počet ložnic, jako PriceLabs), energie a obnovu; plocha je typická plocha
// dispozice, vypsaná jako „od – do“, nájem pro střed. Přesná plocha bytu
// patří do propočtu do 24 hodin, ne do posuvníku.
const sizes: { value: SizeKey; label: string }[] = [
  { value: "1kk", label: "1+kk" },
  { value: "2kk", label: "2+kk" },
  { value: "3kk", label: "3+kk" },
  { value: "4kk", label: "4+kk" },
];

// Sezónní násobky žijí v lib/yield (SEASONS_BY_LOC, z realizovaných řad každé
// lokality); tady jsou jen popisky. Léto + zima + prosinec skládají přesně rok.
const SEASON_KEYS: SeasonKey[] = ["year", "summer", "winter", "xmas"];


const CalculatorSection = () => {
  const { lang } = useLanguage();
  const locLabel = (l: CalcLoc) =>
    l === "jinde" ? t(lang, "calc_loc_other") : `Praha ${l.replace("praha", "")}`;
  // Stav (lokalita, dispozice, plocha, sezóna, vybavení) žije v CalcContext,
  // aby s ním počítal i pětiletý graf v sekci Horizont.
  const { location, setLocation, size, pickSize, m2, season, setSeason, furn, fromShare } = useCalc();
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (fromShare) document.getElementById("kalkulacka")?.scrollIntoView({ block: "start" });
  }, [fromShare]);

  const shareResult = async () => {
    const url = `${window.location.origin}${window.location.pathname}?byt=${location}-${size}-${season}#kalkulacka`;
    trackEvent("calc_share", { district: location, size, season });
    try {
      if (navigator.share) { await navigator.share({ title: "Antam Homes", url }); return; }
    } catch { /* user cancelled — fall through to copy */ }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2500);
    } catch {
      window.prompt(t(lang, "calc_share_copy"), url);
    }
  };

  // Jediný zdroj výpočtu je lib/yield: reálná tržní cena za noc pro čtvrť
  // a pásmo ložnic × sezóna. Dvě čísla z téže ceny: průměr trhu (tržní
  // obsazenost) a s Antam Homes (obsazenost zvednutá, strop 85 %); minus
  // provize platformy, dělení 70/30. Nájem řídí PLOCHA (rentFor).
  const result = useMemo(() => {
    const r = ownerMonthly(location, size, { season });
    const ltr = location === "jinde" ? 0 : rentFor(location as LocationKey, size, m2);
    const ratio = r.supported && ltr > 0 ? r.antam.net / ltr : 0;
    return { r, ltr, ratio };
  }, [location, size, m2, season]);

  // Pětiletý rozdíl pro teaser; sám graf je v sekci Horizont (#horizont) a
  // počítá ze stejného stavu přes lib/horizon.
  const d = useMemo(() => fiveYear(location, size, m2, furn), [location, size, m2, furn]);

  // "mil." / "tis." are Czech; the Vietnamese page counts in "triệu" (million) and "nghìn".
  const short = (n: number) =>
    Math.abs(n) >= 1e6
      ? `${(n / 1e6).toFixed(1).replace(".", ",")}\u00a0${lang === "cs" ? "mil." : "triệu"}`
      : `${Math.round(n / 1000)}\u00a0${lang === "cs" ? "tis." : "nghìn"}`;
  const supported = result.r.supported;

  return (
    <section id="kalkulacka" className="section bg-secondary scroll-mt-16">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "calc_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "calc_title1")}
            <span className="text-gradient-gold">{t(lang, "calc_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "calc_desc")}</p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 md:items-start">
          <Reveal id="kalkulacka-zadani" delay={0.05} className="space-y-8 order-2 md:order-1 scroll-mt-20 min-w-0">
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                {t(lang, "calc_location")}
              </label>
              {/* Mobile: native select (úspora místa) */}
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as CalcLoc)}
                className="sm:hidden w-full min-w-0 max-w-full px-4 py-3 bg-card border border-border rounded-sm font-body text-sm font-medium text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{locLabel(l)}</option>
                ))}
              </select>
              {/* Desktop: tlačítka */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-2">
                {LOCATIONS.map((l) => (
                  <button key={l} type="button" onClick={() => setLocation(l)}
                    className={`px-3 py-2.5 rounded-sm text-sm font-body font-medium transition-all border ${
                      location === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {locLabel(l)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dispozice je viditelně jen rychlá předvolba: předvyplní kapacitu
                a plochu; podle ní se počítají energie a obnova vybavení. */}
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-1.5">
                <Home className="w-4 h-4 text-gold" />
                {t(lang, "calc_size")}
              </label>
              <p className="font-body text-[12.5px] text-muted-foreground leading-snug mb-3">{t(lang, "calc_size_hint")}</p>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <button key={s.value} type="button" onClick={() => pickSize(s.value)}
                    className={`px-2 sm:px-3 py-3 min-w-0 rounded-sm text-sm font-body font-semibold transition-all border ${
                      size === s.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {/* S jakou plochou počítáme: od – do, nájem pro typickou plochu uprostřed. */}
              <p className="mt-3 font-body text-[12.5px] text-muted-foreground leading-snug tnum">
                {t(lang, "calc_area_range_1")} {SIZE_AREA[size][0]} {t(lang, "calc_area_range_2")} {SIZE_AREA[size][1]}&nbsp;m², {t(lang, "calc_area_range_3")} {m2}&nbsp;m². {t(lang, "calc_area_range_4")}
              </p>
            </div>

            {/* Rok je výchozí rozhodnutí; sezónu si rozklikne, kdo ji chce. */}
            <details className="group">
              <summary className="list-none cursor-pointer inline-flex items-center gap-2 font-body text-sm font-semibold text-gold-deep underline underline-offset-4 decoration-gold/40 [&::-webkit-details-marker]:hidden">
                <Calculator className="w-4 h-4 text-gold" />
                {t(lang, "calc_season_toggle")}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SEASON_KEYS.map((key) => (
                  <button key={key} type="button" onClick={() => setSeason(key)}
                    className={`flex flex-col px-3 py-3 rounded-sm font-body transition-all border text-left leading-tight ${
                      season === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    <span className="text-[13px] font-semibold truncate">
                      {t(lang, `calc_season_${key}` as const)}
                    </span>
                    <span className={`text-[11px] mt-0.5 ${season === key ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {t(lang, `calc_season_${key}_sub` as const)}
                    </span>
                  </button>
                ))}
              </div>
            </details>

            {/* Jak se počítá dělení: pod vstupy, ať levý sloupec nekončí dřív než panel (patch 126). */}
            <p className="font-body text-xs md:text-[13px] text-muted-foreground leading-relaxed border-t border-border/60 pt-4 text-pretty">
              {t(lang, "calc_method_note")}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="flex items-start order-1 md:order-2 md:sticky md:top-24">
            <div className="w-full bg-gradient-dark rounded-md p-5 sm:p-7 md:p-9 space-y-4 sm:space-y-5">
              {!supported ? (
                /* Lokalita bez vlastních tržních dat: žádné číslo, poctivé
                   zavření s cestou k propočtu do 24 hodin. */
                <div className="space-y-4">
                  <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em]">
                    {t(lang, "calc_net")}
                  </p>
                  <p className="font-display text-2xl sm:text-[1.75rem] font-semibold text-primary-foreground leading-snug text-balance">
                    {t(lang, "calc_unsupported_title")}
                  </p>
                  <p className="font-body text-[14.5px] text-primary-foreground/80 leading-relaxed">
                    {t(lang, "calc_unsupported_text")}
                  </p>
                  <p className="md:hidden flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
                    <span>{locLabel(location)}</span>
                    <a href="#kalkulacka-zadani" className="ml-1 inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-foreground/30 hover:text-primary-foreground">
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      {t(lang, "calc_edit")}
                    </a>
                  </p>
                  <a
                    href="#kontakt"
                    onClick={() => {
                      trackEvent("cta_click", { location: "calculator_unsupported", target: "contact", district: location, size });
                      window.dispatchEvent(new CustomEvent("antam:prefill-contact", {
                        detail: { location: locLabel(location), size: sizes.find((s) => s.value === size)?.label ?? "", m2 },
                      }));
                    }}
                    className="btn btn-primary-inverse w-full"
                  >
                    {t(lang, "calc_cta")}
                  </a>
                </div>
              ) : (
                <>
                  {result.r.supported && (
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                        {t(lang, "calc_net")}
                      </p>
                      <p className="font-body text-[12px] text-primary-foreground/60 -mt-0.5 mb-1">
                        {t(lang, "calc_net_sub")}
                      </p>
                      <p className="flex flex-wrap items-baseline gap-x-2 leading-tight tnum">
                        <span className="font-display text-[2.25rem] min-[360px]:text-[2.75rem] sm:text-5xl md:text-[3.25rem] font-bold text-gradient-gold-on-dark whitespace-nowrap">
                          ~{(Math.round(result.r.antam.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč
                        </span>
                        <span className="font-body text-sm font-normal text-primary-foreground/65 whitespace-nowrap">
                          {t(lang, "calc_month_suffix")}
                        </span>
                      </p>
                      {/* Jedna věta: na čem číslo stojí a co není. */}
                      <p className="mt-2 font-body text-[13px] text-primary-foreground/75 leading-relaxed">
                        {t(lang, "calc_basis")}
                      </p>
                      {result.r.derived && (
                        <p className="mt-1.5 font-body text-[12px] text-primary-foreground/60 leading-relaxed">
                          {t(lang, "calc_derived_note")}
                        </p>
                      )}
                      {/* Reálná tržní cena: stejná data, bez naší obsazenosti. Kdo si
                          to ověří v PriceLabs nebo AirDNA, najde tahle čísla. */}
                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-sm border border-primary-foreground/15 bg-primary-foreground/[0.05] px-3.5 py-3 font-body tnum">
                        <div className="col-span-2 flex items-baseline justify-between gap-3">
                          <dt className="text-[11px] uppercase tracking-[0.14em] text-primary-foreground/65">{t(lang, "calc_market_label")}</dt>
                          <dd className="text-[11px] text-primary-foreground/50">{BAND_LABEL[result.r.band][lang]} · PriceLabs</dd>
                        </div>
                        <div>
                          <dt className="text-[12px] text-primary-foreground/65 leading-snug">{t(lang, "calc_market_adr")}</dt>
                          <dd className="font-display text-lg font-semibold text-primary-foreground/90">{result.r.adr.toLocaleString("cs-CZ")}&nbsp;Kč</dd>
                        </div>
                        <div>
                          <dt className="text-[12px] text-primary-foreground/65 leading-snug">{t(lang, "calc_market_occ")}</dt>
                          <dd className="font-display text-lg font-semibold text-primary-foreground/90">
                            {Math.round(result.r.market.occupancy * 100)}{lang === "cs" ? "\u00a0%" : "%"}
                            <span className="font-body text-[12px] font-normal text-primary-foreground/60"> → {t(lang, "calc_antam_occ")} {Math.round(result.r.antam.occupancy * 100)}{lang === "cs" ? "\u00a0%" : "%"}</span>
                          </dd>
                        </div>
                        <div className="col-span-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-t border-primary-foreground/10 pt-2">
                          <dt className="text-[12px] text-primary-foreground/75 leading-snug">{t(lang, "calc_market_net")}</dt>
                          <dd className="font-display text-base font-semibold text-primary-foreground/85">~{(Math.round(result.r.market.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč {t(lang, "calc_month_suffix")}</dd>
                        </div>
                      </dl>
                      <p className="md:hidden mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
                        <span>{locLabel(location)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{t(lang, `calc_season_${season}` as const)}</span>
                        <a href="#kalkulacka-zadani" className="ml-1 inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-foreground/30 hover:text-primary-foreground">
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          {t(lang, "calc_edit")}
                        </a>
                      </p>
                    </div>

                    {/* Teaser s konkrétním pětiletým rozdílem; vede na graf v sekci Horizont. */}
                    {d && (
                      <a href="#horizont" onClick={() => trackEvent("calc_tab_5y", { district: location })}
                        className="flex w-full items-center justify-between gap-3 rounded-sm border border-gold/30 bg-gold/10 px-3.5 py-2.5 text-left font-body text-[13px] text-primary-foreground/90 transition-colors hover:bg-gold/15"
                      >
                        <span className="tnum">
                          {t(lang, "calc_teaser_1")}{" "}
                          <strong className="text-gold font-semibold">+{short(d.gap)}&nbsp;Kč</strong>{" "}
                          {t(lang, "calc_teaser_2")}
                        </span>
                        <ChevronRight className="w-4 h-4 shrink-0 text-gold" aria-hidden="true" />
                      </a>
                    )}

                    <div className="border-t border-primary-foreground/10 pt-4">
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-2">
                        {t(lang, "calc_split_label")}
                      </p>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-primary-foreground/10" role="img" aria-label={t(lang, "calc_split_aria")}>
                        <span className="block h-full w-[70%] bg-gold" />
                        <span className="block h-full w-[30%] bg-primary-foreground/25" />
                      </div>
                      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-body text-[13px] tnum">
                        <span className="text-primary-foreground/85">
                          <strong className="text-gold font-semibold">{lang === "cs" ? "70\u00a0%" : "70%"}</strong> {t(lang, "calc_split_owner")}{" "}
                          <span className="text-gold/90">= ~{(Math.round(result.r.antam.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </span>
                        <span className="text-primary-foreground/65 text-right">
                          <strong className="font-semibold text-primary-foreground/80">{lang === "cs" ? "30\u00a0%" : "30%"}</strong> {t(lang, "calc_split_fee")}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-primary-foreground/10 pt-4">
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                        {t(lang, "calc_ltr")}
                      </p>
                      <p className="font-display text-xl font-semibold text-primary-foreground/60 tnum">
                        ~{(Math.round(result.ltr / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč{" "}
                        <span className="font-body text-[12px] font-normal text-primary-foreground/50">{t(lang, "calc_ltr_for")} {m2}&nbsp;m²</span>
                      </p>
                      {result.ratio > 0 && (
                        <p className="font-body text-[13px] text-primary-foreground/85 mt-2">
                          → {t(lang, "calc_approx_prefix")}{" "}
                          <strong className="text-gold">
                            {(Math.round(result.ratio * 10) / 10).toLocaleString("cs-CZ")}×{" "}
                          </strong>
                          {t(lang, "calc_vs_ltr")}
                        </p>
                      )}
                      {/* Hormozi: ztráta je konkrétnější než zisk. Rozdíl měsíčně,
                          jen když model dává víc než nájem; žádné nové číslo, jen odečet. */}
                      {result.r.supported && result.ratio > 1 && (
                        <p className="font-body text-[13px] text-primary-foreground/70 mt-1.5 tnum">
                          {t(lang, "calc_loss_1")}{" "}
                          <strong className="font-semibold text-primary-foreground/90">
                            ~{(Math.round((result.r.antam.net - result.ltr) / 1000) * 1000).toLocaleString("cs-CZ")}
                          </strong>{" "}
                          {t(lang, "calc_loss_2")}
                        </p>
                      )}
                    </div>

                    {/* Krytí menších škod: počítá se z téže dispozice jako odhad.
                        Pravidlo žije v lib/yield. */}
                    <div className="border-t border-primary-foreground/10 pt-4">
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                        {t(lang, "calc_cover_label")}
                      </p>
                      <p className="font-display text-lg font-semibold text-primary-foreground/85 tnum">
                        {annualDamageCover(ROOMS[size]).toLocaleString("cs-CZ")}&nbsp;Kč{" "}
                        <span className="font-body text-[13px] font-normal text-primary-foreground/60">
                          {t(lang, "calc_cover_suffix")}
                        </span>
                      </p>
                      <p className="mt-1 font-body text-[12px] text-primary-foreground/60 leading-relaxed">
                        {t(lang, "calc_cover_note")}
                      </p>
                    </div>

                    <p className="font-body text-[12px] text-primary-foreground/60 leading-relaxed border-t border-primary-foreground/10 pt-4">
                      {t(lang, "calc_excluded_note")}
                    </p>
                    <p className="font-body text-[12px] text-primary-foreground/60 leading-relaxed">
                      {t(lang, "calc_energy_note")}
                    </p>
                  </div>
                  )}


                  <p className="font-body text-[13px] text-primary-foreground/75 leading-relaxed border-t border-primary-foreground/10 pt-4">
                    {t(lang, "calc_bridge")}
                  </p>

                  <div className="space-y-3">
                    <a
                      href="#kontakt"
                      onClick={() => {
                        trackEvent("cta_click", { location: "calculator", target: "contact", district: location, size });
                        window.dispatchEvent(
                          new CustomEvent("antam:prefill-contact", {
                            detail: { location: locLabel(location), size: sizes.find((s) => s.value === size)?.label ?? "", m2 },
                          })
                        );
                      }}
                      className="btn btn-primary-inverse w-full"
                    >
                      {t(lang, "calc_cta")}
                    </a>
                    <button
                      type="button"
                      onClick={shareResult}
                      className="mx-auto flex items-center gap-1.5 font-body text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors underline underline-offset-4 decoration-primary-foreground/25"
                    >
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {shared ? t(lang, "calc_share_done") : t(lang, "calc_share")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>

        {/* Metodika za rozklikem na všech šířkách (brief 8/2026, bod 2); viditelná
            zůstává jen krátká věta, bez které by odhad mohl mást. */}
        <div className="mt-6 sm:mt-8 max-w-prose mx-auto border-t border-border/60 pt-4 sm:pt-5 space-y-2.5">
          <p className="font-body text-xs md:text-[13px] text-foreground/75 text-center leading-relaxed">
            {t(lang, "calc_disclaimer_short")}
          </p>
          <details className="group text-center">
            <summary className="list-none cursor-pointer inline-block font-body text-xs text-muted-foreground underline underline-offset-4 decoration-border [&::-webkit-details-marker]:hidden">
              {t(lang, "calc_disclaimer_toggle")}
            </summary>
            <p className="mt-3 font-body text-xs text-foreground/75 text-left leading-relaxed">
              {t(lang, "calc_disclaimer")}
            </p>
          </details>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
