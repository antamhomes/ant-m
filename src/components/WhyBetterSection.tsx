import { motion } from "framer-motion";
import { ShieldCheck, Eye, TrendingUp, Wrench, CalendarCheck, AlertTriangle, ChevronRight } from "lucide-react";

const comparisons = [
  {
    icon: Eye,
    title: "Kontrola stavu bytu",
    longTerm: "Byt vidíte při podpisu a pak až při předání — za rok může být poškozený a vy to nevíte.",
    shortTerm: "Po každém hostu probíhá důkladná kontrola. V praxi i 2× týdně. O stavu bytu máte neustálý přehled.",
  },
  {
    icon: Wrench,
    title: "Údržba a opravy",
    longTerm: "Nájemník vám závadu často nenahlásí. Drobné problémy se kumulují a na konci nájmu vás čeká drahá oprava.",
    shortTerm: "Malé opravy řešíme průběžně, hned jak se objeví. Byt si tak zachovává svou hodnotu po celou dobu.",
  },
  {
    icon: TrendingUp,
    title: "Maximalizace příjmu",
    longTerm: "Nájemce platí stále stejnou částku, bez ohledu na sezónu nebo poptávku. Přicházíte o tisíce korun měsíčně.",
    shortTerm: "Ceny optimalizujeme každý den podle aktuální poptávky, akcí ve městě a sezónnosti. Výsledek? Až 2–3× vyšší výnos.",
  },
  {
    icon: ShieldCheck,
    title: "Bezpečnost a pojištění",
    longTerm: "Spoléháte na jednoho nájemce. Pokud přestane platit, vymáhání trvá měsíce — a byt je blokovaný.",
    shortTerm: "Každý host je prověřen platformou. Byt je pojištěn a v případě škody se řeší okamžitě, ne za rok.",
  },
  {
    icon: CalendarCheck,
    title: "Flexibilita",
    longTerm: "Smlouva na rok — pokud byt potřebujete, musíte čekat nebo řešit komplikované výpovědi.",
    shortTerm: "Byt můžete kdykoli využít sami. Stačí zablokovat termín v kalendáři a je váš.",
  },
  {
    icon: AlertTriangle,
    title: "Riziko neplatičů",
    longTerm: "Jeden špatný nájemce = měsíce bez příjmu, právní spory a poškozený byt.",
    shortTerm: "Platba probíhá předem. Žádní neplatiči, žádné vymáhání. Peníze máte vždy na účtu.",
  },
];

const moneyFacts = [
  {
    value: "38 000 Kč",
    label: "Průměrný měsíční příjem z 2+kk v Praze přes krátkodobý pronájem",
  },
  {
    value: "18 000 Kč",
    label: "Průměrný měsíční příjem z 2+kk v Praze přes dlouhodobý pronájem",
  },
  {
    value: "240 000 Kč",
    label: "O tolik přicházíte ročně s klasickým pronájmem bytu 2+kk",
  },
];

const WhyBetterSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            Proč ne dlouhodobý pronájem
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            Váš byt si zaslouží{" "}
            <span className="text-gradient-gold">lepší péči</span> i&nbsp;výnos
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-3xl mx-auto">
            Dlouhodobý pronájem se zdá jako bezpečná volba — ale ve skutečnosti
            přicházíte o peníze i o kontrolu nad svým majetkem. Porovnejte sami.
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="space-y-6 mb-20">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-sm border border-border bg-card overflow-hidden"
            >
              {/* Title bar */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/40">
                <item.icon className="w-5 h-5 text-gold shrink-0" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Long-term */}
                <div className="p-6 relative">
                  <span className="inline-block font-body text-xs font-semibold uppercase tracking-wider text-destructive/70 mb-3">
                    ✕ Dlouhodobý pronájem
                  </span>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {item.longTerm}
                  </p>
                </div>

                {/* Short-term */}
                <div className="p-6 bg-gold/5 relative">
                  <span className="inline-block font-body text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                    ✓ Správa s DAU AN
                  </span>
                  <p className="font-body text-foreground leading-relaxed">
                    {item.shortTerm}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money facts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-dark rounded-md p-8 md:p-12"
        >
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground text-center mb-10">
            O kolik peněz{" "}
            <span className="text-gradient-gold">přicházíte?</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {moneyFacts.map((fact, i) => (
              <motion.div
                key={fact.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div
                  className={`font-display text-3xl md:text-4xl font-bold mb-2 ${
                    i === 2 ? "text-gradient-gold" : "text-primary-foreground"
                  }`}
                >
                  {fact.value}
                </div>
                <p className="font-body text-sm text-primary-foreground/60">
                  {fact.label}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-accent-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:brightness-110 transition-all"
            >
              Chci vědět, kolik vydělám
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyBetterSection;
