import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, MapPin, Home, Plus, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const locations = [
  { value: "praha1", label: "Praha 1", multiplier: 1.4 },
  { value: "praha2", label: "Praha 2", multiplier: 1.25 },
  { value: "praha3", label: "Praha 3", multiplier: 1.05 },
  { value: "praha4", label: "Praha 4", multiplier: 1.0 },
  { value: "praha5", label: "Praha 5", multiplier: 1.05 },
  { value: "praha6", label: "Praha 6", multiplier: 1.1 },
  { value: "praha7", label: "Praha 7", multiplier: 1.15 },
  { value: "praha8", label: "Praha 8", multiplier: 0.95 },
  { value: "praha9", label: "Praha 9", multiplier: 0.9 },
  { value: "praha10", label: "Praha 10", multiplier: 0.95 },
];

const sizes = [
  { value: "1kk", label: "1+kk", base: 28000 },
  { value: "2kk", label: "2+kk", base: 42000 },
  { value: "3kk", label: "3+kk", base: 58000 },
  { value: "4kk", label: "4+kk", base: 75000 },
];

const extraKeys = [
  { id: "balkon", labelKey: "calc_extra_balkon" as const, bonus: 3000, icon: "🌿" },
  { id: "parking", labelKey: "calc_extra_parking" as const, bonus: 2500, icon: "🅿️" },
  { id: "klima", labelKey: "calc_extra_klima" as const, bonus: 2000, icon: "❄️" },
  { id: "vyhled", labelKey: "calc_extra_vyhled" as const, bonus: 4000, icon: "🏰" },
  { id: "vybaveni", labelKey: "calc_extra_vybaveni" as const, bonus: 3500, icon: "✨" },
  { id: "vyuziti", labelKey: "calc_extra_wellness" as const, bonus: 5000, icon: "🧖" },
];

const CalculatorSection = () => {
  const { lang } = useLanguage();
  const [location, setLocation] = useState("praha1");
  const [size, setSize] = useState("2kk");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const result = useMemo(() => {
    const sizeData = sizes.find((s) => s.value === size);
    const locationData = locations.find((l) => l.value === location);
    if (!sizeData || !locationData) return { monthly: 0, yearly: 0, classic: 0 };

    const extrasBonus = extraKeys
      .filter((e) => selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.bonus, 0);

    const monthly = Math.round((sizeData.base + extrasBonus) * locationData.multiplier);
    const classic = Math.round(monthly * 0.45);
    return { monthly, yearly: monthly * 12, classic };
  }, [location, size, selectedExtras]);

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
            <div className="w-full bg-gradient-dark rounded-md p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-5 h-5 text-gold" />
                <h3 className="font-display text-lg font-semibold text-primary-foreground">
                  {t(lang, "calc_result")}
                </h3>
              </div>

              <div>
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                  {t(lang, "calc_monthly")}
                </p>
                <p className="font-display text-5xl md:text-6xl font-bold text-gradient-gold">
                  {result.monthly.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
              </div>

              <div className="border-t border-primary-foreground/10 pt-6">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                  {t(lang, "calc_yearly")}
                </p>
                <p className="font-display text-2xl font-bold text-primary-foreground">
                  {result.yearly.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
              </div>

              <div className="border-t border-primary-foreground/10 pt-6">
                <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                  {t(lang, "calc_classic")}
                </p>
                <p className="font-display text-2xl font-bold text-primary-foreground/55 line-through">
                  {result.classic.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
                <p className="font-body text-xs text-primary-foreground/80 mt-2">
                  {t(lang, "calc_compare")}{" "}
                  <strong className="text-gold">
                    {Math.round((result.monthly / result.classic) * 10) / 10}×{" "}
                  </strong>
                  {t(lang, "calc_compare2")}
                </p>
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
