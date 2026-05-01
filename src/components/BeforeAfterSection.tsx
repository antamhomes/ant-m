import { useState } from "react";
import { motion } from "framer-motion";
import beforeImg from "@/assets/before-renovation.png";
import afterImg from "@/assets/after-renovation.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const BeforeAfterSection = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const { lang } = useLanguage();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <section id="jak-to-funguje" className="py-20 md:py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-gold/80 font-body text-xs tracking-[0.3em] uppercase mb-3">
            {t(lang, "beforeAfter_label")}
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
            {t(lang, "beforeAfter_title")}
          </h2>
          <p className="font-body text-muted-foreground text-base max-w-xl mx-auto">
            {t(lang, "beforeAfter_desc")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-sm shadow-lg border border-border"
        >
          <img src={afterImg} alt="Byt po renovaci" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={1024} height={768} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
            <img src={beforeImg} alt="Byt před renovací" className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: `${100 / (sliderPosition / 100)}%` }} loading="lazy" width={1024} height={768} />
          </div>

          <div className="absolute top-0 bottom-0 w-1 bg-gold cursor-ew-resize z-10" style={{ left: `${sliderPosition}%` }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gold rounded-full flex items-center justify-center shadow-lg">
              <span className="text-accent-foreground font-bold text-xs">⟨⟩</span>
            </div>
          </div>

          <input type="range" min="5" max="95" value={sliderPosition} onChange={handleSliderChange} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />

          <div className="absolute top-4 left-4 bg-charcoal/80 text-primary-foreground font-body text-xs tracking-wider uppercase px-3 py-1.5 rounded-sm">
            {t(lang, "before")}
          </div>
          <div className="absolute top-4 right-4 bg-gold/90 text-accent-foreground font-body text-xs tracking-wider uppercase px-3 py-1.5 rounded-sm">
            {t(lang, "after")}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
