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
  { value: "praha1",  label: "Praha 1",  multiplier: 1.55, occupancy: 0.88 },
  { value: "praha2",  label: "Praha 2",  multiplier: 1.30, occupancy: 0.88 },
  { value: "praha3",  label: "Praha 3",  multiplier: 1.05, occupancy: 0.82 },
  { value: "praha4",  label: "Praha 4",  multiplier: 0.85, occupancy: 0.75 },
  { value: "praha5",  label: "Praha 5",  multiplier: 1.00, occupancy: 0.82 },
  { value: "praha6",  label: "Praha 6",  multiplier: 1.00, occupancy: 0.82 },
  { value: "praha7",  label: "Praha 7",  multiplier: 1.15, occupancy: 0.88 },
  { value: "praha8",  label: "Praha 8",  multiplier: 0.85, occupancy: 0.75 },
  { value: "praha9",  label: "Praha 9",  multiplier: 0.75, occupancy: 0.70 },
  { value: "praha10", label: "Praha 10", multiplier: 0.80, occupancy: 0.75 },
];

// Base ADR (Kč/noc), supplies (internet+drogerie/měs), cena 1 úklidu
const sizes: { value: SizeKey; label: string; baseADR: number; supplies: number; cleaningPrice: number }[] = [
  { value: "1kk", label: "1+kk", baseADR: 1950, supplies: 1200, cleaningPrice: 600  },
  { value: "2kk", label: "2+kk", baseADR: 2600, supplies: 1400, cleaningPrice: 700  },
  { value: "3kk", label: "3+kk", baseADR: 3600, supplies: 1700, cleaningPrice: 900  },
  { value: "4kk", label: "4+kk", baseADR: 4900, supplies: 2000, cleaningPrice: 1100 },
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

type Season = "year" | "summer" | "winter";
const seasonAdjust: Record<Season, { adr: number; occDelta: number }> = {
  year:   { adr: 1.00, occDelta: 0    },
  summer: { adr: 1.25, occDelta: 0.08 },
  winter: { adr: 0.80, occDelta: -0.12 },
};

const PLATFORM_FEE = 0.08;
const OUR_FEE = 0.155;
const CLEANINGS_PER_MONTH = 10;
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
      return { adr: 0, occupancy: 0, gross: 0, platformFee: 0, opex: 0, ourFee: 0, net: 0, netYear: 0, ltr: 0, ratio: 0 };
    }
    const extrasPct = extraKeys
      .filter((e) => selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.pct, 0);
    const seasonAdj = seasonAdjust[season];
    const adr = Math.round(sizeData.baseADR * locationData.multiplier * (1 + extrasPct) * seasonAdj.adr);
    const occupancy = Math.max(0.4, Math.min(0.98, locationData.occupancy + seasonAdj.occDelta));
    const gross = Math.round(adr * occupancy * DAYS);
    const platformFee = Math.round(gross * PLATFORM_FEE);
    const opex = sizeData.opex;
    const ourFee = Math.round(gross * OUR_FEE);
    const net = gross - platformFee - opex - ourFee;
    const ltr = ltrTable[location][size];
    const ratio = ltr > 0 ? net / ltr : 0;
    return { adr, occupancy, gross, platformFee, opex, ourFee, net, netYear: net * 12, ltr, ratio };
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
              <div className="grid grid-cols-3 gap-2">
                {(["year", "summer", "winter"] as Season[]).map((s) => (
                  <button key={s} type="button" onClick={() => setSeason(s)}
                    className={`px-2 py-2.5 rounded-sm text-xs sm:text-sm font-body font-medium transition-all border ${
                      season === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {t(lang, `calc_season_${s}` as const)}
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

              {/* Hrubý */}
              <div className="border-t border-primary-foreground/10 pt-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em]">
                    {t(lang, "calc_gross")}
                  </p>
                  <p className="font-display text-2xl font-semibold text-primary-foreground">
                    {result.gross.toLocaleString("cs-CZ")}&nbsp;Kč
                  </p>
                </div>
                <p className="font-body text-[11px] text-primary-foreground/50 mt-1 text-right">
                  {Math.round(result.occupancy * 100)}% {t(lang, "calc_occupancy")} × {DAYS} {lang === "cs" ? "nocí" : "đêm"}
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
                          <span>{t(lang, "calc_platforms")} ({Math.round(PLATFORM_FEE * 100)} %)</span>
                          <span>− {result.platformFee.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </li>
                        <li className="flex justify-between">
                          <span>{t(lang, "calc_operations")}</span>
                          <span>− {result.opex.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </li>
                        <li className="flex justify-between">
                          <span>{t(lang, "calc_our_fee")} ({Math.round(OUR_FEE * 100)} %)</span>
                          <span>− {result.ourFee.toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </li>
                        <li className="text-[11px] text-primary-foreground/50 italic pt-1">
                          {t(lang, "calc_cleaning_note")}
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Net */}
              <div className="border-t border-primary-foreground/10 pt-5">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                  {t(lang, "calc_net")}
                </p>
                <p className="font-display text-5xl md:text-6xl font-bold text-gradient-gold leading-tight">
                  {result.net.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
                <p className="font-body text-sm text-primary-foreground/70 mt-1">
                  {result.netYear.toLocaleString("cs-CZ")}&nbsp;Kč {t(lang, "calc_net_year")}
                </p>
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
