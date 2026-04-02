import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  { number: "01", title: "Nezávazná konzultace", description: "Probereme váš byt, lokalitu a potenciál výnosu." },
  { number: "02", title: "Návrh a přestavba", description: "Naši designéři vytvoří koncept a zrealizují přestavbu." },
  { number: "03", title: "Profesionální foto a listing", description: "Nafotíme byt a vytvoříme top inzerát na Airbnb." },
  { number: "04", title: "Vy inkasujete", description: "My se staráme o vše. Vy sledujete rostoucí příjem." },
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

        <div className="space-y-0">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex items-start gap-6 md:gap-10 py-8 border-b border-primary-foreground/10 last:border-b-0"
            >
              <span className="font-display text-4xl md:text-5xl font-bold text-gradient-gold flex-shrink-0">
                {step.number}
              </span>
              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-primary-foreground mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-primary-foreground/60">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-6 h-6 text-gold/40 flex-shrink-0 hidden md:block mt-2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
