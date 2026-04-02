import { motion } from "framer-motion";

const stats = [
  { value: "150+", label: "Spravovaných bytů" },
  { value: "4.9★", label: "Průměrné hodnocení" },
  { value: "95%", label: "Obsazenost" },
  { value: "2.8×", label: "Vyšší výnos než klasický pronájem" },
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-gradient-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-2">
                {stat.value}
              </div>
              <div className="font-body text-sm text-primary-foreground/60 tracking-wider uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
