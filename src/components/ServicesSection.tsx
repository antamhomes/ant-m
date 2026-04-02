import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const services = [
  {
    title: "Kompletní přestavba",
    items: ["Interiérový design", "Nákup vybavení", "Stavební úpravy", "Profesionální foto"],
  },
  {
    title: "Každodenní správa",
    items: ["Komunikace s hosty 24/7", "Check-in & check-out", "Profesionální úklid", "Praní prádla"],
  },
  {
    title: "Optimalizace a finance",
    items: ["Dynamické cenotvorba", "SEO optimalizace inzerátu", "Měsíční reporting", "Daňové podklady"],
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            Co vše zahrnujeme
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            Kompletní balíček služeb
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Od první konzultace po měsíční výpisy — vše je zahrnuto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-card border border-border p-8 rounded-sm"
            >
              <h3 className="font-display text-xl font-semibold text-foreground mb-6 pb-4 border-b border-border">
                {service.title}
              </h3>
              <ul className="space-y-4">
                {service.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="font-body text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
