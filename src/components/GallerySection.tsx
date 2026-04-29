import { motion } from "framer-motion";
import portfolioLivingDining from "@/assets/portfolio-living-dining.jpg";
import portfolioBedroomMaster from "@/assets/portfolio-bedroom-master.jpg";
import portfolioLivingTerrace from "@/assets/portfolio-living-terrace.jpg";
import portfolioBedroomCozy from "@/assets/portfolio-bedroom-cozy.jpg";
import realBedroomLuxury from "@/assets/real-bedroom-luxury.jpg";
import realLivingRoom from "@/assets/real-living-room.jpg";
import realBedroomModern from "@/assets/real-bedroom-modern.jpg";
import realLivingCozy from "@/assets/real-living-cozy.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

// Editoriální mozaika 8 fotek na 4 sloupcích / 4 řádcích
const gallery = [
  { src: portfolioLivingDining, alt: "Obývací pokoj s jídelnou", span: "md:col-span-2 md:row-span-2" },
  { src: portfolioBedroomMaster, alt: "Hlavní ložnice", span: "md:col-span-2" },
  { src: portfolioLivingTerrace, alt: "Obývací pokoj s výhledem na terasu", span: "" },
  { src: portfolioBedroomCozy, alt: "Útulná ložnice", span: "" },
  { src: realBedroomLuxury, alt: "Luxusní ložnice", span: "md:col-span-2" },
  { src: realLivingRoom, alt: "Moderní obývací pokoj", span: "" },
  { src: realBedroomModern, alt: "Stylová ložnice", span: "" },
  { src: realLivingCozy, alt: "Útulný obývací pokoj", span: "md:col-span-2" },
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

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[220px] gap-4">
          {gallery.map((item, index) => (
            <motion.div
              key={item.alt}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
              className={`overflow-hidden rounded-sm group relative ${item.span}`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={1600}
                height={1067}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
