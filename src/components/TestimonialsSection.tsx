import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Martin K.",
    location: "Praha 2",
    text: "Měl jsem byt, který jsem pronajímal za 18 000 Kč měsíčně. Teď díky nim mám přes 45 000 Kč čistého. Přestavba se zaplatila za 4 měsíce.",
    rating: 5,
  },
  {
    name: "Jana S.",
    location: "Praha 5",
    text: "Nemusím řešit absolutně nic. Jednou za měsíc dostanu výpis a peníze na účet. Perfektní servis od A do Z.",
    rating: 5,
  },
  {
    name: "Tomáš V.",
    location: "Brno",
    text: "Bál jsem se svěřit byt cizím lidem. Po roce spolupráce můžu říct, že to bylo nejlepší rozhodnutí. Byt je v lepším stavu, než když jsem ho kupoval.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-12 md:py-16 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            Reference
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            Co říkají naši klienti
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-card border border-border p-8 rounded-sm"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="font-body text-foreground/80 leading-relaxed mb-6 italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div>
                <p className="font-body font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {testimonial.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
