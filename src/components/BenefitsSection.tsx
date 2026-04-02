import { motion } from "framer-motion";
import { TrendingUp, Shield, Clock, Wrench, Star, Banknote } from "lucide-react";

const benefits = [
  {
    icon: Banknote,
    title: "Pasivní příjem",
    description: "Váš byt vydělává bez vaší práce. Průměrně 2–3× více než klasický pronájem.",
  },
  {
    icon: Wrench,
    title: "Kompletní přestavba",
    description: "Zařídíme vše od designu po realizaci. Váš byt bude vypadat jako z magazínu.",
  },
  {
    icon: Shield,
    title: "Pojištění a bezpečnost",
    description: "Každý host je prověřen. Byt je pojištěn a pod neustálým dohledem.",
  },
  {
    icon: Clock,
    title: "0 starostí",
    description: "Úklid, komunikace s hosty, údržba — vše řešíme my, 24/7.",
  },
  {
    icon: TrendingUp,
    title: "Dynamické ceny",
    description: "Naše algoritmy nastaví optimální cenu každý den pro maximální výnos.",
  },
  {
    icon: Star,
    title: "5★ hodnocení",
    description: "Naši hosté hodnotí průměrně 4.9★. To znamená lepší viditelnost a více rezervací.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            Proč se to vyplatí
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            Svěřte nám svůj byt a&nbsp;my ho proměníme ve <span className="text-gradient-gold">zlatý důl</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Nemusíte se starat o nic. Získáte prémiový příjem z nemovitosti, kterou vlastníte.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-sm bg-card border border-border hover:border-gold/30 transition-all duration-500 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-sm bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors duration-300">
                <benefit.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
