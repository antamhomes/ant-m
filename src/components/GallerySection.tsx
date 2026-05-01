import { motion } from "framer-motion";
import portfolioLivingDining from "@/assets/portfolio-living-dining.jpg";
import portfolioBedroomMaster from "@/assets/portfolio-bedroom-master.jpg";
import realLivingRoom from "@/assets/real-living-room.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const portfolio: { src: string; titleKey: TranslationKey; descKey: TranslationKey; alt: string }[] = [
  {
    src: portfolioLivingDining,
    titleKey: "portfolio1_title",
    descKey: "portfolio1_desc",
    alt: "Byt v centru Prahy",
  },
  {
    src: portfolioBedroomMaster,
    titleKey: "portfolio2_title",
    descKey: "portfolio2_desc",
    alt: "Byt pro pracovní pobyty",
  },
  {
    src: realLivingRoom,
    titleKey: "portfolio3_title",
    descKey: "portfolio3_desc",
    alt: "Moderní byt s garáží",
  },
];

const GallerySection = () => {
  const { lang } = useLanguage();

  return (
    <section id="portfolio" className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "gallery_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            {t(lang, "gallery_title")}
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(lang, "gallery_desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {portfolio.map((item, index) => (
            <motion.article
              key={item.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-card border border-border rounded-sm overflow-hidden hover:border-gold/30 transition-all duration-500"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  width={1600}
                  height={1200}
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2">
                  {t(lang, item.titleKey)}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {t(lang, item.descKey)}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
