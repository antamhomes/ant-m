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
          className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/55 to-charcoal/85"
        />
        {/* Extra readability gradient behind headline */}
        <div className="absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_center,_hsl(var(--charcoal)/0.55)_0%,_transparent_70%)] pointer-events-none" />
      </motion.div>

      <div className="relative z-10 text-primary-foreground text-center px-6 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-primary-foreground leading-[1.2] sm:leading-[1.05] tracking-[-0.015em] sm:tracking-[-0.025em] mb-5 sm:mb-6 [text-shadow:0_2px_24px_hsl(var(--charcoal)/0.55)] text-balance text-7xl"
        >
          {t(lang, "hero_title1")}
          <br />
          <span className="text-gradient-gold">{t(lang, "hero_title2")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-body text-base sm:text-lg md:text-xl leading-relaxed text-primary-foreground/95 mb-6 sm:mb-4 max-w-2xl mx-auto [text-shadow:0_1px_12px_hsl(var(--charcoal)/0.6)]"
        >
          {t(lang, "hero_desc")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto"
        >
          <a
            href="#kalkulacka"
            className="btn-hero-primary inline-flex items-center justify-center font-body"
          >
            <span className="relative z-10 inline-flex items-center">
              {t(lang, "hero_cta")}
              <span className="arrow" aria-hidden="true">→</span>
            </span>
          </a>
          <a
            href="#kontakt"
            className="btn-hero-secondary inline-flex items-center justify-center font-body"
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
