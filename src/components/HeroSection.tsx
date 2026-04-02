import { motion } from "framer-motion";
import heroImg from "@/assets/hero-apartment.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Luxusní byt spravovaný naším týmem"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/50 to-charcoal/80" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-6"
        >
          Kompletní správa vašeho bytu
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground leading-tight mb-6"
        >
          Váš byt. Naše péče.{" "}
          <span className="text-gradient-gold">Váš zisk.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-body text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto"
        >
          Přeměníme váš byt v prémiové ubytování na Airbnb. Od kompletní
          přestavby po každodenní správu — vy jen inkasujete.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#kontakt"
            className="inline-flex items-center justify-center px-8 py-4 bg-gold text-accent-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:brightness-110 transition-all duration-300"
          >
            Chci nezávaznou konzultaci
          </a>
          <a
            href="#jak-to-funguje"
            className="inline-flex items-center justify-center px-8 py-4 border border-primary-foreground/30 text-primary-foreground font-body font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-primary-foreground/10 transition-all duration-300"
          >
            Jak to funguje
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-primary-foreground/40 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-gold rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
