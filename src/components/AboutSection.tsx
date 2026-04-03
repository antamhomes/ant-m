import { motion } from "framer-motion";
import { Heart, Sparkles, Building2 } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="o-nas" className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            O nás
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            Tři kamarádi, jedna vize
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
            Jsme mladý a ambiciózní tým — jeden Čech a dva Vietnamci, které spojila
            láska k designu a nemovitostem. Věříme, že každý byt má potenciál být
            něčím víc než jen čtyři stěny a střecha.
          </p>
          <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
            Naše různorodé zázemí nám dává unikátní perspektivu. Kombinujeme české
            know‑how s mezinárodním pohledem na pohostinnost a design, díky čemuž
            tvoříme prostory, do kterých se hosté rádi vrací.
          </p>
          <p className="font-body text-muted-foreground text-lg leading-relaxed">
            Nejsme korporace. Jsme lidé, kterým záleží na každém detailu — od výběru
            polštářů po cenovou strategii. Vaši nemovitost bereme jako svou vlastní.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Heart,
              title: "Vášeň pro detail",
              desc: "Každý byt navrhujeme s citem pro estetiku a pohodlí hostů. Interiéry, které vypadají skvěle a fungují ještě lépe.",
            },
            {
              icon: Sparkles,
              title: "Mladí & ambiciózní",
              desc: "Přinášíme svěží energii, moderní přístup a technologie, které tradičním správcům chybí.",
            },
            {
              icon: Building2,
              title: "Zkušenosti s nemovitostmi",
              desc: "Desítky úspěšně spravovaných bytů v Praze. Známe trh, víme co funguje a co ne.",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
