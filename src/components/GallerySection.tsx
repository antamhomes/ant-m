import { motion } from "framer-motion";
import bedroomImg from "@/assets/apartment-bedroom.jpg";
import kitchenImg from "@/assets/apartment-kitchen.jpg";
import bathroomImg from "@/assets/apartment-bathroom.jpg";
import heroImg from "@/assets/hero-apartment.jpg";

const gallery = [
  { src: heroImg, alt: "Luxusní obývací pokoj", span: "md:col-span-2 md:row-span-2" },
  { src: bedroomImg, alt: "Designová ložnice", span: "" },
  { src: kitchenImg, alt: "Moderní kuchyně", span: "" },
  { src: bathroomImg, alt: "Elegantní koupelna", span: "md:col-span-2" },
];

const GallerySection = () => {
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
            Portfolio
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            Naše realizace
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Každý byt navrhujeme tak, aby hosté měli pocit luxusu a vy maximální výnos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gallery.map((item, index) => (
            <motion.div
              key={item.alt}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`overflow-hidden rounded-sm group ${item.span}`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover aspect-square md:aspect-auto md:h-full group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={1024}
                height={768}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
