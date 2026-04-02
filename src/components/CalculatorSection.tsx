import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, MapPin, Home, Plus, Check } from "lucide-react";

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

const extras = [
  { id: "balkon", label: "Balkón / terasa", bonus: 3000, icon: "🌿" },
  { id: "parking", label: "Parkovací místo", bonus: 2500, icon: "🅿️" },
  { id: "klima", label: "Klimatizace", bonus: 2000, icon: "❄️" },
  { id: "vyhled", label: "Výhled na památky", bonus: 4000, icon: "🏰" },
  { id: "vybaveni", label: "Premium vybavení", bonus: 3500, icon: "✨" },
  { id: "vyuziti", label: "Vlastní wellness / sauna", bonus: 5000, icon: "🧖" },
];

const CalculatorSection = () => {
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

    const extrasBonus = extras
      .filter((e) => selectedExtras.includes(e.id))
      .reduce((sum, e) => sum + e.bonus, 0);

    const monthly = Math.round((sizeData.base + extrasBonus) * locationData.multiplier);
    const classic = Math.round(monthly * 0.45);
    return { monthly, yearly: monthly * 12, classic };
  }, [location, size, selectedExtras]);

  return (
    <section id="kalkulacka" className="py-24 bg-muted/30">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            Kalkulačka výnosu
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Kolik vám byt{" "}
            <span className="text-gradient-gold">vydělá?</span>
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
            Zadejte parametry vašeho bytu a zjistěte odhadovaný měsíční příjem
            při správě přes DAU AN s.r.o.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Left – inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Location */}
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                Lokalita
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {locations.map((loc) => (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => setLocation(loc.value)}
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

            {/* Size */}
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Home className="w-4 h-4 text-gold" />
                Dispozice
              </label>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSize(s.value)}
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

            {/* Extras */}
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Plus className="w-4 h-4 text-gold" />
                Vychytávky navíc
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extras.map((extra) => {
                  const active = selectedExtras.includes(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body transition-all border text-left ${
                        active
                          ? "bg-gold/10 border-gold text-foreground"
                          : "bg-card border-border text-foreground hover:border-gold/50"
                      }`}
                    >
                      <span className="text-lg">{extra.icon}</span>
                      <span className="flex-1">{extra.label}</span>
                      {active && <Check className="w-4 h-4 text-gold" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right – results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center"
          >
            <div className="w-full bg-gradient-dark rounded-md p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-5 h-5 text-gold" />
                <h3 className="font-display text-lg font-semibold text-primary-foreground">
                  Odhadovaný výnos
                </h3>
              </div>

              {/* Monthly */}
              <div>
                <p className="font-body text-sm text-primary-foreground/50 uppercase tracking-wider mb-1">
                  Měsíční příjem s DAU AN
                </p>
                <p className="font-display text-5xl md:text-6xl font-bold text-gradient-gold">
                  {result.monthly.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
              </div>

              {/* Yearly */}
              <div className="border-t border-primary-foreground/10 pt-6">
                <p className="font-body text-sm text-primary-foreground/50 uppercase tracking-wider mb-1">
                  Roční příjem
                </p>
                <p className="font-display text-2xl font-bold text-primary-foreground">
                  {result.yearly.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
              </div>

              {/* Comparison */}
              <div className="border-t border-primary-foreground/10 pt-6">
                <p className="font-body text-sm text-primary-foreground/50 uppercase tracking-wider mb-1">
                  Klasický dlouhodobý pronájem
                </p>
                <p className="font-display text-2xl font-bold text-primary-foreground/40 line-through">
                  {result.classic.toLocaleString("cs-CZ")}&nbsp;Kč
                </p>
                <p className="font-body text-xs text-gold mt-2">
                  S námi vyděláte až{" "}
                  <strong>
                    {Math.round((result.monthly / result.classic) * 10) / 10}×
                    více
                  </strong>{" "}
                  než klasickým pronájmem
                </p>
              </div>

              <a
                href="#kontakt"
                className="block w-full text-center px-6 py-3.5 bg-gold text-accent-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:brightness-110 transition-all"
              >
                Chci bezplatnou konzultaci
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
