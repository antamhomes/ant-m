import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, MapPin, Home, Plus, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import CalculatorLeadDialog from "./CalculatorLeadDialog";
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

// Dispozice určuje výchozí kapacitu; cena za noc se odvíjí od počtu hostů.
// Úklid a prádlo hradí host v ceně rezervace a zajišťuje antam homes — do výnosu majitele nevstupují.
// Energie (elektřina, voda, plyn) hradí majitel a v odhadu nejsou zahrnuty.
const sizes: { value: SizeKey; label: string; defaultGuests: GuestsKey }[] = [
  { value: "1kk", label: "1+kk", defaultGuests: 2 },
  { value: "2kk", label: "2+kk", defaultGuests: 4 },
  { value: "3kk", label: "3+kk", defaultGuests: 8 },
  { value: "4kk", label: "4+kk", defaultGuests: 10 },
];

// Base ADR (Kč/noc) podle kapacity — 3+kk pro 6 hostů se cení jinak než 3+kk pro 8.
type GuestsKey = 2 | 4 | 6 | 8 | 10;
const guestOptions: { value: GuestsKey; label: string; baseADR: number }[] = [
  { value: 2,  label: "2",   baseADR: 1665 },
  { value: 4,  label: "4",   baseADR: 2250 },
  { value: 6,  label: "6",   baseADR: 2620 },
  { value: 8,  label: "8",   baseADR: 3060 },
  { value: 10, label: "10+", baseADR: 4140 },
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

// Dlouhodobý nájem (Kč/měs) — sreality benchmark 2025
const ltrTable: Record<LocationKey, Record<SizeKey, number>> = {
  praha1:  { "1kk": 22000, "2kk": 32000, "3kk": 45000, "4kk": 62000 },
  praha2:  { "1kk": 19000, "2kk": 28000, "3kk": 38000, "4kk": 52000 },
  praha3:  { "1kk": 17000, "2kk": 24000, "3kk": 32000, "4kk": 44000 },
  praha4:  { "1kk": 15000, "2kk": 21000, "3kk": 28000, "4kk": 38000 },
  praha5:  { "1kk": 16500, "2kk": 23000, "3kk": 31000, "4kk": 42000 },
  praha6:  { "1kk": 17500, "2kk": 25000, "3kk": 34000, "4kk": 46000 },
  praha7:  { "1kk": 17500, "2kk": 25000, "3kk": 34000, "4kk": 46000 },
  praha8:  { "1kk": 14500, "2kk": 20000, "3kk": 27000, "4kk": 36000 },
  praha9:  { "1kk": 13000, "2kk": 18000, "3kk": 24000, "4kk": 32000 },
  praha10: { "1kk": 14000, "2kk": 19500, "3kk": 26000, "4kk": 35000 },
};

type Season = "year" | "summer" | "winter" | "xmas";
const seasonAdjust: Record<Season, { adr: number; occDelta: number }> = {
  year:   { adr: 1.05, occDelta: 0.02 },
  summer: { adr: 1.33, occDelta: 0.08 },
  winter: { adr: 0.88, occDelta: 0.05 },
  xmas:   { adr: 1.75, occDelta: 0.12 },
};

const MGMT_FEE = 0.25; // provize antam homes: 25 % z výnosu z ubytování
const DAYS = 30;
// Obsazenost = obsazenost lokality + sezónní úprava, omezená na realistické pásmo.
const MIN_OCCUPANCY = 0.5;
const MAX_OCCUPANCY = 0.98;
const clampOccupancy = (v: number) => Math.max(MIN_OCCUPANCY, Math.min(MAX_OCCUPANCY, v));

const CalculatorSection = () => {
  const { lang } = useLanguage();
  const [location, setLocation] = useState<LocationKey>("praha2");
  const [size, setSizeState] = useState<SizeKey>("2kk");
  const [guests, setGuests] = useState<GuestsKey>(4);
  // Změna dispozice přednastaví obvyklou kapacitu; hosty pak lze doladit ručně.
  const setSize = (v: SizeKey) => {
    setSizeState(v);
    setGuests(sizes.find((s) => s.value === v)?.defaultGuests ?? 4);
  };
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [season, setSeason] = useState<Season>("year");
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const result = useMemo(() => {
    const sizeData = guestOptions.find((g) => g.value === guests);
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
  }, [location, size, guests, selectedExtras, season]);

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
          <motion.div {...revealDelayed(0.05)} className="space-y-8 order-2 md:order-1">
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
                    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gold/15 text-gold text-[11px] font-semibold">
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
                <p className="font-display text-5xl md:text-6xl font-bold text-gradient-gold leading-tight tnum">
                  <span className="whitespace-nowrap">
                    ~{(Math.round(result.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč{" "}
                    <span className="font-body text-sm font-normal text-primary-foreground/65">
                      {t(lang, "calc_month_suffix")}
                    </span>
                  </span>
                </p>
                {/* Assumption: layout + capacity. Capacity is adjustable inline — no extra step for the owner. */}
                <p className="mt-2 font-body text-[12px] text-primary-foreground/65 flex flex-wrap items-center gap-x-1.5">
                  <span>{t(lang, "calc_assume_prefix")}</span>
                  <span className="text-primary-foreground/85">{sizes.find((s) => s.value === size)?.label}</span>
                  <span aria-hidden="true">·</span>
                  <label className="inline-flex items-center gap-1">
                    <span className="sr-only">{t(lang, "calc_guests")}</span>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value) as GuestsKey)}
                      className="bg-transparent border-0 border-b border-gold/60 text-primary-foreground/90 font-semibold tnum px-0.5 py-0 text-[12px] focus:outline-none focus:border-gold cursor-pointer appearance-none"
                      aria-label={t(lang, "calc_guests")}
                    >
                      {guestOptions.map((g) => (
                        <option key={g.value} value={g.value} className="text-foreground">{g.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gold/80" aria-hidden="true" />
                    <span>{t(lang, "calc_guests_unit")}</span>
                  </label>
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
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { location: "calculator", target: "lead_dialog", district: location, size });
                    setLeadOpen(true);
                  }}
                  className="btn btn-primary-inverse w-full"
                >
                  {t(lang, "calc_cta")}
                </button>
                <a
                  href="#kontakt"
                  className="block w-full text-center font-body text-xs text-primary-foreground/65 hover:text-gold tracking-[0.15em] uppercase transition-colors"
                >
                  {lang === "cs" ? "nebo nezávazně probrat byt →" : "hoặc trao đổi trực tiếp, không ràng buộc →"}
                </a>
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
      <CalculatorLeadDialog
        open={leadOpen}
        onOpenChange={setLeadOpen}
        locationLabel={locations.find((l) => l.value === location)?.label ?? ""}
        sizeLabel={`${sizes.find((s) => s.value === size)?.label ?? ""} · ${guests === 10 ? "10+" : guests} ${t(lang, "calc_guests_unit")}`}
      />
    </section>
  );
};

export default CalculatorSection;
