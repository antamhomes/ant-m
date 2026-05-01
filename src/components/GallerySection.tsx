import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import portfolioLivingDining from "@/assets/portfolio-living-dining.jpg";
import portfolioBedroomMaster from "@/assets/portfolio-bedroom-master.jpg";
import realLivingRoom from "@/assets/real-living-room.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const portfolio: { src: string; titleKey: TranslationKey; descKey: TranslationKey; tagsKey: TranslationKey; alt: string; location: string }[] = [
  {
    src: portfolioLivingDining,
    titleKey: "portfolio1_title",
    descKey: "portfolio1_desc",
    tagsKey: "portfolio1_tags",
    alt: "Byt v centru Prahy",
    location: "Praha 1",
  },
  {
    src: portfolioBedroomMaster,
    titleKey: "portfolio2_title",
    descKey: "portfolio2_desc",
    tagsKey: "portfolio2_tags",
    alt: "Byt pro pracovní pobyty",
    location: "Mladá Boleslav",
  },
  {
    src: realLivingRoom,
    titleKey: "portfolio3_title",
    descKey: "portfolio3_desc",
    tagsKey: "portfolio3_tags",
    alt: "Moderní byt s garáží",
    location: "Praha 3",
  },
];

const GallerySection = () => {
  const { lang } = useLanguage();

  return (
    <section id="portfolio" className="py-16 md:py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
          <p className="font-body text-[11px] text-muted-foreground/70 tracking-[0.2em] uppercase mt-5">
            ← {lang === "cs" ? "přejeďte prstem" : "vuốt để xem"} →
          </p>
        </motion.div>

        <div
          className="
            flex gap-6 lg:gap-8
            overflow-x-auto
            snap-x snap-mandatory
            -mx-6 px-6 pb-4
            scrollbar-none
            [&::-webkit-scrollbar]:hidden
          "
        >
          {portfolio.map((item, index) => {
            const tags = t(lang, item.tagsKey) as unknown as string[];
            const visibleTags = tags.slice(0, 2);
            return (
              <motion.article
                key={item.titleKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group bg-card border border-border rounded-sm overflow-hidden hover:border-gold/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500 shrink-0 w-[82%] sm:w-[46%] md:w-[44%] lg:w-[31%] snap-center lg:snap-start"
              >
                <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-[1400ms] ease-out"
                    loading="lazy"
                    width={1600}
                    height={2000}
                  />
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal/65 backdrop-blur-sm text-primary-foreground">
                    <MapPin className="w-3 h-3 text-gold" />
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase">
                      {item.location}
                    </span>
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2 leading-snug line-clamp-2">
                    {t(lang, item.titleKey)}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm md:text-[14px] leading-relaxed mb-4 line-clamp-2">
                    {t(lang, item.descKey)}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {visibleTags.map((tag) => (
                      <li
                        key={tag}
                        className="font-body text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-gold/30 text-gold/90 bg-gold/5"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
