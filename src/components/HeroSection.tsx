import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import heroImg from "@/assets/real-bedroom-luxury.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const HeroSection = () => {
  const { lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Very subtle parallax: image moves slower than scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: imageY }}>
        <img
          src={heroImg}
          alt="Luxusní byt spravovaný naším týmem"
          className="w-full h-[115%] object-cover"
          width={1920}
          height={1080}
        />
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/55 to-charcoal/90"
        />
      </motion.div>

      <div className="relative z-10 text-primary-foreground text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-6"
        >
          {t(lang, "hero_subtitle")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-[2.25rem] sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground leading-[1.1] mb-6"
        >
          {t(lang, "hero_title1")}
          <br />
          <span className="text-gradient-gold">{t(lang, "hero_title2")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-body text-lg md:text-xl text-primary-foreground/85 mb-3 max-w-2xl mx-auto"
        >
          {t(lang, "hero_desc")}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-body text-sm md:text-base text-primary-foreground/75 mb-10 max-w-xl mx-auto"
        >
          {t(lang, "hero_extra")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto"
        >
          <a
            href="#kontakt"
            className="btn-hero-primary inline-flex items-center justify-center font-body text-[14px]"
          >
            <span className="relative z-10">{t(lang, "hero_cta")}</span>
          </a>
          <a
            href="#jak-to-funguje"
            className="btn-hero-secondary inline-flex items-center justify-center font-body text-[14px]"
          >
            {t(lang, "hero_cta2")}
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
