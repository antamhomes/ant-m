import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, MapPin, Home, Plus, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

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

// Base ADR (Kč/noc), supplies (internet+drogerie/měs), cena 1 úklidu
const sizes: { value: SizeKey; label: string; baseADR: number; supplies: number; cleaningPrice: number; avgStayNights: number; energy: number }[] = [
  { value: "1kk", label: "1+kk", baseADR: 1850, supplies: 1200, cleaningPrice: 600,  avgStayNights: 3,   energy: 3500 },
  { value: "2kk", label: "2+kk", baseADR: 2500, supplies: 1400, cleaningPrice: 700,  avgStayNights: 3,   energy: 5000 },
  { value: "3kk", label: "3+kk", baseADR: 3400, supplies: 1700, cleaningPrice: 900,  avgStayNights: 3.5, energy: 6500 },
  { value: "4kk", label: "4+kk", baseADR: 4600, supplies: 2000, cleaningPrice: 1100, avgStayNights: 4,   energy: 8500 },
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

const PLATFORM_FEE = 0.155;
const MGMT_FEE = 0.22; // 22 % z net po platformě/úklidu/supplies — střed pásma 20–25 %
const DAYS = 30;

const CalculatorSection = () => {
  const { lang } = useLanguage();
  const [location, setLocation] = useState<LocationKey>("praha2");
  const [size, setSize] = useState<SizeKey>("2kk");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [season, setSeason] = useState<Season>("year");
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const result = useMemo(() => {
    const sizeData = sizes.find((s) => s.value === size);
    const locationData = locations.find((l) => l.value === location);
    if (!sizeData || !locationData) {
      return { adr: 0, occupancy: 0, gross: 0, platformFee: 0, cleaning: 0, cleanings: 0, supplies: 0, mgmt: 0, energy: 0, net: 0, netYearAvg: 0, ltr: 0, ratio: 0 };
    }
    const extrasPct = extraKeys
      .filter((e) => selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.pct, 0);
    const seasonAdj = seasonAdjust[season];
    const adr = Math.round(sizeData.baseADR * locationData.multiplier * (1 + extrasPct) * seasonAdj.adr);
    const occupancy = Math.max(0.88, Math.min(0.98, locationData.occupancy + seasonAdj.occDelta));
    const gross = Math.round(adr * occupancy * DAYS);
    const platformFee = Math.round(gross * PLATFORM_FEE);
    const cleanings = Math.max(1, Math.round((occupancy * DAYS) / sizeData.avgStayNights));
    const cleaning = sizeData.cleaningPrice * cleanings;
    const supplies = sizeData.supplies;
    const netBeforeMgmt = gross - platformFee - cleaning - supplies;
    const mgmt = Math.round(netBeforeMgmt * MGMT_FEE);
    const net = netBeforeMgmt - mgmt;
    const energy = sizeData.energy;

    // Roční průměr — vždy počítaný ze sezóny "year", nezávisle na výběru
    const yAdj = seasonAdjust.year;
    const yAdr = Math.round(sizeData.baseADR * locationData.multiplier * (1 + extrasPct) * yAdj.adr);
    const yOcc = Math.max(0.88, Math.min(0.98, locationData.occupancy + yAdj.occDelta));
    const yGross = Math.round(yAdr * yOcc * DAYS);
    const yPlatform = Math.round(yGross * PLATFORM_FEE);
    const yCleanings = Math.max(1, Math.round((yOcc * DAYS) / sizeData.avgStayNights));
    const yCleaning = sizeData.cleaningPrice * yCleanings;
    const yNetBeforeMgmt = yGross - yPlatform - yCleaning - sizeData.supplies;
    const yNetMonth = yNetBeforeMgmt - Math.round(yNetBeforeMgmt * MGMT_FEE);
    const netYearAvg = yNetMonth * 12;

    const ltr = ltrTable[location][size];
    const ratio = ltr > 0 ? net / ltr : 0;
    return { adr, occupancy, gross, platformFee, cleaning, cleanings, supplies, mgmt, energy, net, netYearAvg, ltr, ratio };
  }, [location, size, selectedExtras, season]);

  return (
    <section id="kalkulacka" className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "calc_label")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t(lang, "calc_title1")}
            <span className="text-gradient-gold">{t(lang, "calc_title2")}</span>
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
            {t(lang, "calc_desc")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 order-2 md:order-1"
          >
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                {t(lang, "calc_location")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Plus className="w-4 h-4 text-gold" />
                {t(lang, "calc_extras")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center order-1 md:order-2"
          >
            <div className="w-full bg-gradient-dark rounded-md p-7 md:p-9 space-y-6">
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-gold" />
                <h3 className="font-display text-lg font-semibold text-primary-foreground">
                  {t(lang, "calc_result")}
                </h3>
              </div>

              {/* ADR */}
              <div className="flex items-baseline justify-between">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em]">
                  {t(lang, "calc_adr")}
                </p>
                <p className="font-display text-xl font-semibold text-primary-foreground">
                  {result.adr.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
              </div>

              {/* Obsazenost */}
              <div className="flex items-baseline justify-between -mt-3">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em]">
                  {t(lang, "calc_occupancy")}
                </p>
                <p className="font-body text-sm font-semibold text-primary-foreground/85">
                  {Math.round(result.occupancy * 100)} %
                  <span className="text-primary-foreground/50 font-normal ml-1.5">
                    ({Math.round(result.occupancy * DAYS)}/{DAYS} {lang === "cs" ? "nocí" : "đêm"})
                  </span>
                </p>
              </div>

              {/* Rozpad */}
              <div className="border-t border-primary-foreground/10 pt-4">
                <button
                  type="button"
                  onClick={() => setBreakdownOpen((o) => !o)}
                  className="w-full flex items-center justify-between font-body text-xs text-primary-foreground/75 uppercase tracking-[0.15em] hover:text-gold transition-colors"
                >
                  <span>{t(lang, "calc_breakdown")}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${breakdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {breakdownOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-4 space-y-2 font-body text-sm text-primary-foreground/80">
                        <li className="flex justify-between">
                          <span>{t(lang, "calc_platforms")} ({(PLATFORM_FEE * 100).toLocaleString("cs-CZ")} %)</span>
                          <span>− {result.platformFee.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </li>
                        <li className="flex justify-between">
                          <span>{t(lang, "calc_cleaning")} ({result.cleanings}× {lang === "cs" ? "měs." : "/tháng"})</span>
                          <span>− {result.cleaning.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </li>
                        <li className="flex justify-between">
                          <span>{t(lang, "calc_operations")}</span>
                          <span>− {result.supplies.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </li>
                        <li className="flex justify-between">
                          <span>{t(lang, "calc_our_fee")} ({Math.round(MGMT_FEE * 100)} %)</span>
                          <span>− {result.mgmt.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </li>
                      </ul>
                      <p className="mt-3 font-body text-[11px] text-primary-foreground/55 leading-relaxed">
                        {t(lang, "calc_excluded_note")}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Net */}
              <div className="border-t border-primary-foreground/10 pt-5">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                  {t(lang, "calc_net")}
                </p>
                <p className="font-body text-[11px] text-primary-foreground/55 -mt-0.5 mb-1">
                  {t(lang, "calc_net_sub")}
                </p>
                <p className="font-display text-5xl md:text-6xl font-bold text-gradient-gold leading-tight">
                  {result.net.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
                <p className="font-body text-[11px] text-primary-foreground/50 mt-2 leading-relaxed">
                  {String(t(lang, "calc_excluded_note")).replace("{energy}", result.energy.toLocaleString("cs-CZ"))}
                </p>
              </div>

              {/* Roční průměr (vždy ze sezóny year) */}
              <div className="border-t border-primary-foreground/10 pt-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em]">
                    {t(lang, "calc_net_year")}
                  </p>
                  <p className="font-display text-xl font-semibold text-primary-foreground">
                    {result.netYearAvg.toLocaleString("cs-CZ")}&nbsp;Kč
                  </p>
                </div>
              </div>

              {/* LTR srovnání */}
              <div className="border-t border-primary-foreground/10 pt-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em]">
                    {t(lang, "calc_ltr")}
                  </p>
                  <p className="font-display text-xl font-semibold text-primary-foreground/60">
                    {result.ltr.toLocaleString("cs-CZ")}&nbsp;Kč
                  </p>
                </div>
                {result.ratio > 0 && (
                  <p className="font-body text-xs text-primary-foreground/85 mt-2">
                    →{" "}
                    <strong className="text-gold">
                      {(Math.round(result.ratio * 10) / 10).toLocaleString("cs-CZ")}×{" "}
                    </strong>
                    {t(lang, "calc_vs_ltr")}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <a
                  href="#kontakt"
                  className="block w-full text-center px-6 py-3.5 bg-primary text-primary-foreground font-body font-semibold text-[13px] tracking-[0.15em] uppercase rounded-sm hover:bg-charcoal border border-gold/60 ring-1 ring-gold/30 hover:ring-gold/60 transition-all"
                >
                  {t(lang, "calc_cta")}
                </a>
                <a
                  href="#kontakt"
                  className="block w-full text-center font-body text-xs text-primary-foreground/65 hover:text-gold tracking-[0.15em] uppercase transition-colors"
                >
                  {lang === "cs" ? "nebo nezávazně probrat byt →" : "hoặc trao đổi nhẹ nhàng →"}
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 max-w-2xl mx-auto border-t border-border/60 pt-6">
          <p className="font-body text-xs md:text-[13px] text-muted-foreground text-center leading-relaxed">
            {t(lang, "calc_disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
