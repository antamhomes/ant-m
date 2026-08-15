import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, MapPin, Home, Plus, Check, ChevronDown, Share2, Pencil } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { reveal, revealDelayed } from "@/lib/motion";

type SizeKey = "1kk" | "2kk" | "3kk" | "4kk";
type LocationKey =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9" | "praha10";

const locations: { value: LocationKey; label: string; multiplier: number; occupancy: number }[] = [
  { value: "praha1",  label: "Praha 1",  multiplier: 1.45, occupancy: 0.85 },
  { value: "praha2",  label: "Praha 2",  multiplier: 1.25, occupancy: 0.83 },
  { value: "praha3",  label: "Praha 3",  multiplier: 1.05, occupancy: 0.80 },
  { value: "praha4",  label: "Praha 4",  multiplier: 0.80, occupancy: 0.72 },
  { value: "praha5",  label: "Praha 5",  multiplier: 1.00, occupancy: 0.78 },
  { value: "praha6",  label: "Praha 6",  multiplier: 0.95, occupancy: 0.76 },
  { value: "praha7",  label: "Praha 7",  multiplier: 1.15, occupancy: 0.83 },
  { value: "praha8",  label: "Praha 8",  multiplier: 0.85, occupancy: 0.74 },
  { value: "praha9",  label: "Praha 9",  multiplier: 0.70, occupancy: 0.68 },
  { value: "praha10", label: "Praha 10", multiplier: 0.80, occupancy: 0.73 },
];

// Base ADR (Kč/noc) podle dispozice; každá dispozice počítá s obvyklou kapacitou bytu
// (guestsCs/guestsVi je jen popisek — česky se správným skloňováním).
// Úklid a prádlo hradí host v ceně rezervace a zajišťuje Antam Homes — do výnosu majitele nevstupují.
// Energie (elektřina, voda, plyn) hradí majitel a v odhadu nejsou zahrnuty.
const sizes: { value: SizeKey; label: string; baseADR: number; guestsCs: string; guestsVi: string }[] = [
  { value: "1kk", label: "1+kk", baseADR: 1665, guestsCs: "2–4 hosté",  guestsVi: "2–4 khách" },
  { value: "2kk", label: "2+kk", baseADR: 2250, guestsCs: "6–8 hostů",  guestsVi: "6–8 khách" },
  { value: "3kk", label: "3+kk", baseADR: 3060, guestsCs: "8–10 hostů", guestsVi: "8–10 khách" },
  { value: "4kk", label: "4+kk", baseADR: 4140, guestsCs: "10–12 hostů", guestsVi: "10–12 khách" },
];

// Extras jako % bonus na ADR
const extraKeys = [
  { id: "balkon",   labelKey: "calc_extra_balkon"   as const, pct: 0.04, icon: "🌿" },
  { id: "parking",  labelKey: "calc_extra_parking"  as const, pct: 0.05, icon: "🅿️" },
  { id: "klima",    labelKey: "calc_extra_klima"    as const, pct: 0.03, icon: "❄️" },
  { id: "vyhled",   labelKey: "calc_extra_vyhled"   as const, pct: 0.08, icon: "🏰" },
  { id: "vybaveni", labelKey: "calc_extra_vybaveni" as const, pct: 0.06, icon: "✨" },
  { id: "vyuziti",  labelKey: "calc_extra_wellness" as const, pct: 0.05, icon: "🧖" },
];

// Dlouhodobý nájem (Kč/měs) — cenová mapa nájemného Bohemian Estates, 11/2025; 4+kk ≈ 1,3× 3+kk
const ltrTable: Record<LocationKey, Record<SizeKey, number>> = {
  praha1:  { "1kk": 23000, "2kk": 28000, "3kk": 32000, "4kk": 41500 },
  praha2:  { "1kk": 21500, "2kk": 28000, "3kk": 32500, "4kk": 42500 },
  praha3:  { "1kk": 20500, "2kk": 26500, "3kk": 31000, "4kk": 40500 },
  praha4:  { "1kk": 18000, "2kk": 23000, "3kk": 26000, "4kk": 33500 },
  praha5:  { "1kk": 18500, "2kk": 24500, "3kk": 28000, "4kk": 36000 },
  praha6:  { "1kk": 19000, "2kk": 25500, "3kk": 30000, "4kk": 39000 },
  praha7:  { "1kk": 20000, "2kk": 25500, "3kk": 30500, "4kk": 40000 },
  praha8:  { "1kk": 16000, "2kk": 21500, "3kk": 24000, "4kk": 31000 },
  praha9:  { "1kk": 18500, "2kk": 23500, "3kk": 29000, "4kk": 37500 },
  praha10: { "1kk": 18000, "2kk": 23000, "3kk": 27500, "4kk": 35500 },
};

type Season = "year" | "summer" | "winter" | "xmas";
const seasonAdjust: Record<Season, { adr: number; occDelta: number }> = {
  year:   { adr: 1.05, occDelta: 0.02 },
  summer: { adr: 1.33, occDelta: 0.08 },
  winter: { adr: 0.88, occDelta: 0.05 },
  xmas:   { adr: 1.75, occDelta: 0.12 },
};

const MGMT_FEE = 0.25; // provize Antam Homes: 25 % z výnosu z ubytování
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
      return { adr: 0, occupancy: 0, gross: 0, mgmt: 0, net: 0, netYearAvg: 0, ltr: 0, ratio: 0 };
    }
    const extrasPct = extraKeys
      .filter((e) => selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.pct, 0);
    const seasonAdj = seasonAdjust[season];
    const adr = Math.round(sizeData.baseADR * locationData.multiplier * (1 + extrasPct) * seasonAdj.adr);
    const occupancy = clampOccupancy(locationData.occupancy + seasonAdj.occDelta);
    const gross = Math.round(adr * occupancy * DAYS);
    // Čistý příjem majitele = výnos z ubytování − provize 25 %.
    // Úklid hradí host (a zajišťujeme ho my), energie platí majitel zvlášť.
    const mgmt = Math.round(gross * MGMT_FEE);
    const net = gross - mgmt;

    // Roční průměr — vždy počítaný ze sezóny "year", nezávisle na výběru
    const yAdj = seasonAdjust.year;
    const yAdr = Math.round(sizeData.baseADR * locationData.multiplier * (1 + extrasPct) * yAdj.adr);
    const yOcc = clampOccupancy(locationData.occupancy + yAdj.occDelta);
    const yGross = Math.round(yAdr * yOcc * DAYS);
    const yNetMonth = yGross - Math.round(yGross * MGMT_FEE);
    const netYearAvg = yNetMonth * 12;

    const ltr = ltrTable[location][size];
    const ratio = ltr > 0 ? net / ltr : 0;
    return { adr, occupancy, gross, mgmt, net, netYearAvg, ltr, ratio };
  }, [location, size, selectedExtras, season]);

  return (
    <section id="kalkulacka" className="section bg-muted/30 scroll-mt-16">
      <div className="container-narrow">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "calc_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "calc_title1")}
            <span className="text-gradient-gold">{t(lang, "calc_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "calc_desc")}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 md:items-start">
          <motion.div id="kalkulacka-zadani" {...revealDelayed(0.05)} className="space-y-8 order-2 md:order-1 scroll-mt-20">
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                {t(lang, "calc_location")}
              </label>
              {/* Mobile: native select (úspora místa) */}
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as LocationKey)}
                className="sm:hidden w-full px-4 py-3 bg-card border border-border rounded-sm font-body text-sm font-medium text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
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
                    className={`px-3 py-3 rounded-sm text-sm font-body font-semibold transition-all border ${
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
                <AnimatePresence initial={false}>
                  {extrasOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
          </motion.div>

          <motion.div {...revealDelayed(0.1)} className="flex items-start order-1 md:order-2 md:sticky md:top-24">
            <div className="w-full bg-gradient-dark rounded-md p-7 md:p-9 space-y-5">
              {/* Net */}
              <div>
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                  {t(lang, "calc_net")}
                </p>
                <p className="font-body text-[11px] text-primary-foreground/55 -mt-0.5 mb-1">
                  {t(lang, "calc_net_sub")}
                </p>
                <p className="font-display text-5xl md:text-6xl font-bold text-gradient-gold-on-dark leading-tight tnum">
                  <span className="whitespace-nowrap">
                    ~{(Math.round(result.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč{" "}
                    <span className="font-body text-sm font-normal text-primary-foreground/65">
                      {t(lang, "calc_month_suffix")}
                    </span>
                  </span>
                </p>
                {/* Assumption line: layout + its usual capacity (fixed, no extra choice for the owner). */}
                <p className="mt-2 font-body text-[12px] text-primary-foreground/65 tnum">
                  {t(lang, "calc_assume_prefix")}{" "}
                  <span className="text-primary-foreground/85">{sizes.find((s) => s.value === size)?.label}</span>
                  {" · "}
                  {t(lang, "calc_capacity_label")}{" "}
                  <span className="text-primary-foreground/85">
                    {lang === "cs" ? sizes.find((s) => s.value === size)?.guestsCs : sizes.find((s) => s.value === size)?.guestsVi}
                  </span>
                </p>
                {/* Mobile only: the inputs sit below the result, so recap them here with a way back. */}
                <p className="md:hidden mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[12px] text-primary-foreground/70">
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

              {/* 75 / 25 split — the honest version of "kolik vám zůstane". */}
              <div className="border-t border-primary-foreground/10 pt-4">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-2">
                  {t(lang, "calc_split_label")}
                </p>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-primary-foreground/10" role="img" aria-label={t(lang, "calc_split_aria")}>
                  <span className="block h-full w-3/4 bg-gold" />
                  <span className="block h-full w-1/4 bg-primary-foreground/25" />
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-3 font-body text-[12px] tnum">
                  <span className="text-primary-foreground/85 whitespace-nowrap">
                    <strong className="text-gold font-semibold">75 %</strong> {t(lang, "calc_split_owner")}{" "}
                    <span className="text-gold/90">= ~{(Math.round(result.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč</span>
                  </span>
                  <span className="text-primary-foreground/65 text-right">
                    <strong className="font-semibold text-primary-foreground/80">25 %</strong> {t(lang, "calc_split_fee")}
                  </span>
                </div>
                <p className="mt-1.5 font-body text-[11px] text-primary-foreground/55 leading-relaxed">
                  {t(lang, "calc_split_note")}
                </p>
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
                  <p className="font-body text-xs text-primary-foreground/85 mt-2">
                    → {t(lang, "calc_approx_prefix")}{" "}
                    <strong className="text-gold">
                      {(Math.round(result.ratio * 10) / 10).toLocaleString("cs-CZ")}×{" "}
                    </strong>
                    {t(lang, "calc_vs_ltr")}
                  </p>
                )}
              </div>

              <p className="font-body text-[11px] text-primary-foreground/60 leading-relaxed border-t border-primary-foreground/10 pt-4">
                {t(lang, "calc_excluded_note")}
              </p>

              <div className="space-y-3">
                <p className="font-body text-xs text-primary-foreground/60 text-center tracking-wide">
                  {t(lang, "calc_trust_line")}
                </p>
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
          </motion.div>
        </div>

        <div className="mt-8 max-w-2xl mx-auto border-t border-border/60 pt-5">
          <p className="font-body text-xs md:text-[13px] text-foreground/75 text-center leading-relaxed">
            {t(lang, "calc_disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
