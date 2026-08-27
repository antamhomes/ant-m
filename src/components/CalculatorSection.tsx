import { useState, useMemo, useEffect } from "react";
import Reveal from "@/components/Reveal";
import { Calculator, MapPin, Home, Plus, Check, ChevronDown, Share2, Pencil } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { DISTRICTS, BASE_ADR, LTR as LTR_TABLE, type LocationKey as LK, type SizeKey as SK } from "@/lib/yield";

type SizeKey = "1kk" | "2kk" | "3kk" | "4kk";
type LocationKey =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9" | "praha10";

// Kalibrováno 27. 8. 2026 proti skutečným datům, ne proti tržnímu průměru:
// Hospitable (byt 302, 12 měsíců, 143 rezervací) + PriceLabs ADR/obsazenost a percentily
// okolních nabídek. Dvě zjištění, která starou tabulku opravila:
//  1) mezi vnějšími čtvrtěmi je na krátkodobém pronájmu mnohem menší rozdíl než na nájmu
//     (medián ADR 1BR: okolí P3 1 971, P5 2 276, P4/P9 2 110 = rozptyl ~15 %, ne 31 %),
//  2) obsazenost, kterou spravované byty reálně drží, je 83–92 %, ne 68–85 %.
// Pravidlo pro tyto hodnoty: vlastní portfolio musí veřejné číslo PŘEKONAT, nikdy ho minout.
const locations: { value: LocationKey; label: string; multiplier: number; occupancy: number }[] =
  (["praha1","praha2","praha3","praha4","praha5","praha6","praha7","praha8","praha9","praha10"] as LocationKey[])
    .map((v) => ({ value: v, label: `Praha ${v.replace("praha", "")}`, ...DISTRICTS[v] }));

// Base ADR (Kč/noc) podle dispozice; každá dispozice počítá s obvyklou kapacitou bytu
// (guestsCs/guestsVi je jen popisek, česky se správným skloňováním).
// Úklidový poplatek hradí host v ceně rezervace a patří Antam Homes; do výnosu majitele nevstupuje,
// ale platformy z něj počítají provizi, proto vstupuje do odpočtu provize níže.
// Energie (elektřina, voda) hradí majitel a v odhadu nejsou zahrnuty.
// ADR = benchmark ceny za noc po provizi platformy (Airbnb/Booking); hrubé tržby za ubytování
// se z něj dopočítávají přes PLATFORM_FEE (viz výpočet).
const sizes: { value: SizeKey; label: string; baseADR: number; guestsCs: string; guestsVi: string }[] = [
  { value: "1kk", label: "1+kk", baseADR: BASE_ADR["1kk"], guestsCs: "2–4 hosté",  guestsVi: "2–4 khách" },
  { value: "2kk", label: "2+kk", baseADR: BASE_ADR["2kk"], guestsCs: "6–8 hostů",  guestsVi: "6–8 khách" },
  { value: "3kk", label: "3+kk", baseADR: BASE_ADR["3kk"], guestsCs: "8–10 hostů", guestsVi: "8–10 khách" },
  { value: "4kk", label: "4+kk", baseADR: BASE_ADR["4kk"], guestsCs: "10–12 hostů", guestsVi: "10–12 khách" },
];

// Extras jako % bonus na ADR
const extraKeys = [
  { id: "balkon",   labelKey: "calc_extra_balkon"   as const, pct: 0.04, icon: "🌿" },
  { id: "parking",  labelKey: "calc_extra_parking"  as const, pct: 0.05, icon: "🅿️" },
  { id: "klima",    labelKey: "calc_extra_klima"    as const, pct: 0.03, icon: "❄️" },
  { id: "vyuziti",  labelKey: "calc_extra_wellness" as const, pct: 0.05, icon: "🧖" },
];

// Dlouhodobý nájem (Kč/měs) — cenová mapa nájemného Bohemian Estates, 11/2025; 4+kk ≈ 1,3× 3+kk
const ltrTable = LTR_TABLE;

type Season = "year" | "summer" | "winter" | "xmas";
// Sezónní přirážky sladěné se skutečnými výsledky bytů v naší správě (8/2025–7/2026).
// Po kalibraci 27. 8. 2026 vychází 2+kk Praha 1 rok ≈ 52 tis. pro majitele; měřená skutečnost
// bytu 302 za 12 měsíců je ≈ 53 tis., tedy veřejné číslo je mírně pod skutečností (záměr).
// Léto/Vánoce zvedají hlavně cenu, ne obsazenost (ta je i v lednu přes 80 %).
const seasonAdjust: Record<Season, { adr: number; occDelta: number }> = {
  year:   { adr: 1.05, occDelta: 0.02 },
  summer: { adr: 1.25, occDelta: 0.03 },
  winter: { adr: 0.70, occDelta: 0.0 },
  xmas:   { adr: 1.65, occDelta: 0.05 },
};

const MGMT_FEE = 0.25; // odměna Antam Homes: 25 % z čistého výnosu (po provizi platformy a DPH z ní)
// Provize platforem se počítá z CELÉ ceny rezervace včetně úklidového poplatku
// a z provize se u nás odvádí česká DPH (reverse charge).
const PLATFORM_FEE = 0.15;    // orientační smíšená sazba provize Airbnb/Booking.com
const CLEANING_SHARE = 0.10;  // interní odhad podílu úklidových poplatků na tržbách za ubytování (jen pro odpočet provize)
const VAT_RATE = 1.21;        // DPH z provize platformy
const DAYS = 30;
// Obsazenost = obsazenost lokality + sezónní úprava, omezená na realistické pásmo.
const MIN_OCCUPANCY = 0.5;
const MAX_OCCUPANCY = 0.98;
const clampOccupancy = (v: number) => Math.max(MIN_OCCUPANCY, Math.min(MAX_OCCUPANCY, v));

const CalculatorSection = () => {
  const { lang } = useLanguage();
  // A shared link (?byt=praha2-2kk-year) opens the calculator with the same setting.
  const initial = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("byt");
    if (!raw) return null;
    const [loc, sz, se] = raw.split("-");
    return {
      location: locations.some((l) => l.value === loc) ? (loc as LocationKey) : null,
      size: sizes.some((x) => x.value === sz) ? (sz as SizeKey) : null,
      season: se && se in seasonAdjust ? (se as Season) : null,
    };
  }, []);
  const [location, setLocation] = useState<LocationKey>(initial?.location ?? "praha2");
  const [size, setSize] = useState<SizeKey>(initial?.size ?? "2kk");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [season, setSeason] = useState<Season>(initial?.season ?? "year");
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (initial) document.getElementById("kalkulacka")?.scrollIntoView({ block: "start" });
  }, [initial]);

  const shareResult = async () => {
    const url = `${window.location.origin}${window.location.pathname}?byt=${location}-${size}-${season}#kalkulacka`;
    trackEvent("calc_share", { district: location, size, season });
    const title = "Antam Homes";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2500);
    } catch {
      window.prompt(t(lang, "calc_share_copy"), url);
    }
  };

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const result = useMemo(() => {
    const sizeData = sizes.find((s) => s.value === size);
    const locationData = locations.find((l) => l.value === location);
    if (!sizeData || !locationData) {
      return { adr: 0, occupancy: 0, gross: 0, platformFee: 0, mgmt: 0, net: 0, netYearAvg: 0, ltr: 0, ratio: 0 };
    }
    const extrasPct = extraKeys
      .filter((e) => selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.pct, 0);

    // Výpočet podle smlouvy: z hrubých tržeb za ubytování se nejdřív odečte provize
    // platformy včetně DPH (počítá se z celé ceny rezervace včetně úklidu),
    // zbytek (čistý výnos) se dělí 75/25.
    const compute = (seasonKey: Season) => {
      const adj = seasonAdjust[seasonKey];
      const adrNet = Math.round(sizeData.baseADR * locationData.multiplier * (1 + extrasPct) * adj.adr);
      const occupancy = clampOccupancy(locationData.occupancy + adj.occDelta);
      // Hrubé tržby za ubytování (před provizí platformy) z benchmarkového ADR.
      const gross = Math.round((adrNet / (1 - PLATFORM_FEE)) * occupancy * DAYS);
      // Odpočet = sazba provize × (tržby za ubytování + odhad úklidových poplatků) × DPH.
      const platformFee = Math.round(PLATFORM_FEE * gross * (1 + CLEANING_SHARE) * VAT_RATE);
      const netRevenue = gross - platformFee; // čistý výnos
      const mgmt = Math.round(netRevenue * MGMT_FEE);
      const net = netRevenue - mgmt;
      return { adr: adrNet, occupancy, gross, platformFee, mgmt, net };
    };

    const r = compute(season);
    // Roční průměr — vždy počítaný ze sezóny "year", nezávisle na výběru
    const netYearAvg = compute("year").net * 12;

    const ltr = ltrTable[location][size];
    const ratio = ltr > 0 ? r.net / ltr : 0;
    return { ...r, netYearAvg, ltr, ratio };
  }, [location, size, selectedExtras, season]);

  return (
    <section id="kalkulacka" className="section bg-muted/30 scroll-mt-16">
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
                onChange={(e) => setLocation(e.target.value as LocationKey)}
                className="sm:hidden w-full min-w-0 max-w-full px-4 py-3 bg-card border border-border rounded-sm font-body text-sm font-medium text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
              {/* Desktop: tlačítka */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-2">
                {locations.map((loc) => (
                  <button key={loc.value} type="button" onClick={() => setLocation(loc.value)}
                    className={`px-3 py-2.5 rounded-sm text-sm font-body font-medium transition-all border ${
                      location === loc.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Home className="w-4 h-4 text-gold" />
                {t(lang, "calc_size")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <button key={s.value} type="button" onClick={() => setSize(s.value)}
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
            </div>

            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Calculator className="w-4 h-4 text-gold" />
                {t(lang, "calc_season")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["year", "summer", "winter", "xmas"] as Season[]).map((key) => (
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
            </div>

            <div>
              {/* Mobile: collapsible toggle */}
              <button
                type="button"
                onClick={() => setExtrasOpen((o) => !o)}
                className="sm:hidden w-full flex items-center justify-between gap-2 font-body text-sm font-semibold text-foreground mb-3 hover:text-gold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-gold" />
                  {t(lang, "calc_extras")}
                  {selectedExtras.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gold/15 text-gold-deep text-[11px] font-semibold">
                      {selectedExtras.length}
                    </span>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${extrasOpen ? "rotate-180" : ""}`} />
              </button>
              {/* Tablet/Desktop: static label */}
              <label className="hidden sm:flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Plus className="w-4 h-4 text-gold" />
                {t(lang, "calc_extras")}
              </label>

              {/* Mobile collapsible */}
              <div className="sm:hidden">
                <div className={`collapse-grid ${extrasOpen ? "is-open" : ""}`} aria-hidden={!extrasOpen}>
                  <div>
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {extraKeys.map((extra) => {
                          const active = selectedExtras.includes(extra.id);
                          return (
                            <button key={extra.id} type="button" onClick={() => toggleExtra(extra.id)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body transition-all border text-left ${
                                active
                                  ? "bg-gold/10 border-gold text-foreground"
                                  : "bg-card border-border text-foreground hover:border-gold/50"
                              }`}
                            >
                              <span className="text-lg">{extra.icon}</span>
                              <span className="flex-1">{t(lang, extra.labelKey)}</span>
                              {active && <Check className="w-4 h-4 text-gold" />}
                            </button>
                          );
                        })}
                      </div>
                  </div>
                </div>
              </div>

              {/* Tablet/Desktop: always visible */}
              <div className="hidden sm:grid sm:grid-cols-2 gap-2">
                {extraKeys.map((extra) => {
                  const active = selectedExtras.includes(extra.id);
                  return (
                    <button key={extra.id} type="button" onClick={() => toggleExtra(extra.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body transition-all border text-left ${
                        active
                          ? "bg-gold/10 border-gold text-foreground"
                          : "bg-card border-border text-foreground hover:border-gold/50"
                      }`}
                    >
                      <span className="text-lg">{extra.icon}</span>
                      <span className="flex-1">{t(lang, extra.labelKey)}</span>
                      {active && <Check className="w-4 h-4 text-gold" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex items-start order-1 md:order-2 md:sticky md:top-24">
            <div className="w-full bg-gradient-dark rounded-md p-5 sm:p-7 md:p-9 space-y-4 sm:space-y-5">
              {/* Net */}
              <div>
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                  {t(lang, "calc_net")}
                </p>
                <p className="font-body text-[12px] text-primary-foreground/60 -mt-0.5 mb-1">
                  {t(lang, "calc_net_sub")}
                </p>
                <p className="flex flex-wrap items-baseline gap-x-2 leading-tight tnum">
                  <span className="font-display text-[2.25rem] min-[360px]:text-[2.75rem] sm:text-5xl md:text-[3.25rem] font-bold text-gradient-gold-on-dark whitespace-nowrap">
                    ~{(Math.round(result.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč
                  </span>
                  <span className="font-body text-sm font-normal text-primary-foreground/65 whitespace-nowrap">
                    {t(lang, "calc_month_suffix")}
                  </span>
                </p>
                {/* Assumption line: layout + its usual capacity (fixed, no extra choice for the owner). */}
                <p className="mt-2 font-body text-[13px] text-primary-foreground/70 tnum">
                  {t(lang, "calc_assume_prefix")}{" "}
                  <span className="text-primary-foreground/85">{sizes.find((s) => s.value === size)?.label}</span>
                  {" · "}
                  {t(lang, "calc_capacity_label")}{" "}
                  <span className="text-primary-foreground/85">
                    {lang === "cs" ? sizes.find((s) => s.value === size)?.guestsCs : sizes.find((s) => s.value === size)?.guestsVi}
                  </span>
                </p>
                {/* Mobile only: the inputs sit below the result, so recap them here with a way back. */}
                <p className="md:hidden mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
                  <span>{locations.find((l) => l.value === location)?.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t(lang, `calc_season_${season}` as const)}</span>
                  <a
                    href="#kalkulacka-zadani"
                    className="ml-1 inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-foreground/30 hover:text-primary-foreground"
                  >
                    <Pencil className="w-3 h-3" aria-hidden="true" />
                    {t(lang, "calc_edit")}
                  </a>
                </p>
              </div>

              {/* 75/25 split. Platform commission incl. VAT is deducted inside the math;
                 the sub-line and the note under the calculator say so, no scary number here. */}
              <div className="border-t border-primary-foreground/10 pt-4">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-2">
                  {t(lang, "calc_split_label")}
                </p>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-primary-foreground/10" role="img" aria-label={t(lang, "calc_split_aria")}>
                  <span className="block h-full w-[75%] bg-gold" />
                  <span className="block h-full w-[25%] bg-primary-foreground/25" />
                </div>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-body text-[13px] tnum">
                  <span className="text-primary-foreground/85">
                    <strong className="text-gold font-semibold">75 %</strong> {t(lang, "calc_split_owner")}{" "}
                    <span className="text-gold/90">= ~{(Math.round(result.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč</span>
                  </span>
                  <span className="text-primary-foreground/65 text-right">
                    <strong className="font-semibold text-primary-foreground/80">25 %</strong> {t(lang, "calc_split_fee")}
                  </span>
                </div>
              </div>

              {/* LTR srovnání */}
              <div className="border-t border-primary-foreground/10 pt-4">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                  {t(lang, "calc_ltr")}
                </p>
                <p className="font-display text-xl font-semibold text-primary-foreground/60 tnum">
                  ~{(Math.round(result.ltr / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč
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
              </div>

              <p className="font-body text-[12px] text-primary-foreground/60 leading-relaxed border-t border-primary-foreground/10 pt-4">
                {t(lang, "calc_excluded_note")}
              </p>
              <p className="font-body text-[12px] text-primary-foreground/60 leading-relaxed">
                {t(lang, "calc_energy_note")}
              </p>

              <div className="space-y-3">
                <a
                  href="#kontakt"
                  onClick={() => {
                    trackEvent("cta_click", { location: "calculator", target: "contact", district: location, size });
                    // Pre-fill the contact form with what the owner just set in the calculator.
                    window.dispatchEvent(
                      new CustomEvent("antam:prefill-contact", {
                        detail: { location: locations.find((l) => l.value === location)?.label ?? "", size: sizes.find((s) => s.value === size)?.label ?? "" },
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
            </div>
          </Reveal>
        </div>

        {/* Phones: the methodology note folds behind one line; larger screens show it in full. */}
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto border-t border-border/60 pt-4 sm:pt-5">
          <p className="font-body text-xs md:text-[13px] text-foreground/80 text-center leading-relaxed mb-3 sm:mb-4">
            {t(lang, "calc_method_note")}
          </p>
          <details className="sm:hidden group">
            <summary className="list-none cursor-pointer font-body text-xs text-muted-foreground text-center underline underline-offset-4 decoration-border [&::-webkit-details-marker]:hidden">
              {t(lang, "calc_disclaimer_toggle")}
            </summary>
            <p className="mt-3 font-body text-xs text-foreground/75 text-center leading-relaxed">
              {t(lang, "calc_disclaimer")}
            </p>
          </details>
          <p className="hidden sm:block font-body text-xs md:text-[13px] text-foreground/75 text-center leading-relaxed">
            {t(lang, "calc_disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
