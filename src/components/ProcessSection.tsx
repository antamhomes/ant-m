import { motion } from "framer-motion";
import { MessageSquare, Paintbrush, Camera, TrendingUp } from "lucide-react";

const steps = [
  { number: "01", title: "Nezávazná konzultace", description: "Probereme váš byt, lokalitu a potenciál výnosu.", icon: MessageSquare },
  { number: "02", title: "Návrh a přestavba", description: "Naši designéři vytvoří koncept a zrealizují přestavbu.", icon: Paintbrush },
  { number: "03", title: "Profesionální foto a listing", description: "Nafotíme byt a vytvoříme top inzerát na Airbnb.", icon: Camera },
  { number: "04", title: "Vy inkasujete", description: "My se staráme o vše. Vy sledujete rostoucí příjem.", icon: TrendingUp },
];

const ProcessSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-gradient-dark">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            Proces
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary-foreground mb-6">
            4 kroky k pasivnímu příjmu
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-8 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-sm hover:border-gold/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-gold/60 mb-1 block">
                      Krok {step.number}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-primary-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="font-body text-primary-foreground/60 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
