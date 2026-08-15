import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import heroImg from "@/assets/hero-bedroom.webp";
import heroImgSm from "@/assets/hero-bedroom-1280.webp";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { useSplashDone } from "@/hooks/use-splash-done";

const HeroSection = () => {
  const { lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const ready = useSplashDone();
  // Entrance animations wait for the splash to lift so they are actually seen.
  const enter = (y: number, delay: number, duration = 0.7) => ({
    initial: { opacity: 0, y },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration, delay: ready ? delay : 0, ease: [0.22, 1, 0.36, 1] as const },
  });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Very subtle parallax: image moves slower than scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: imageY }}
        initial={{ scale: 1.06 }}
        animate={{ scale: ready ? 1 : 1.06 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={heroImg}
          srcSet={`${heroImgSm} 1280w, ${heroImg} 1920w`}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          onLoad={() => window.dispatchEvent(new Event("antam:hero-ready"))}
          className="w-full h-[115%] object-cover"
          width={1920}
          height={1530}
        />
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/55 to-charcoal/85"
        />
        {/* Extra readability gradient behind headline */}
        <div className="absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_center,_hsl(var(--charcoal)/0.55)_0%,_transparent_70%)] pointer-events-none" />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.div
          {...enter(12, 0.35, 0.6)}
          className="font-body text-[0.78rem] sm:text-sm tracking-[0.22em] uppercase mb-5 sm:mb-6"
          style={{ color: "#C2A46D" }}
        >
          {t(lang, "hero_subtitle")}
        </motion.div>

        <motion.h1
          {...enter(20, 0.45, 0.8)}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.1] tracking-[-0.02em] mb-5 sm:mb-6 text-balance"
          style={{ color: "#F7F1E8" }}
        >
          {t(lang, "hero_title1")}
          <br />
          {t(lang, "hero_title2")}
        </motion.h1>

        <motion.p
          {...enter(16, 0.65, 0.6)}
          className="font-body text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto text-pretty"
          style={{ color: "#E8DED0" }}
        >
          {t(lang, "hero_desc")}
        </motion.p>

        <motion.div
          {...enter(16, 0.8, 0.6)}
          className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center"
        >
          <a
            href="#kalkulacka"
            onClick={() => trackEvent("cta_click", { location: "hero", target: "calculator" })}
            className="btn btn-primary-inverse px-8 py-4"
          >
            {t(lang, "hero_cta")}
          </a>
          <a
            href="#kontakt"
            onClick={() => trackEvent("cta_click", { location: "hero", target: "contact" })}
            className="btn btn-secondary-inverse px-8 py-4"
          >
            {t(lang, "hero_cta2")}
            <span className="text-gold" aria-hidden="true">→</span>
          </a>
        </motion.div>

        {/* Trust line under the CTAs: three facts, no adjectives. */}
        <motion.p
          {...enter(10, 1.0, 0.6)}
          className="mt-5 sm:mt-6 font-body text-[13px] sm:text-sm tracking-wide"
          style={{ color: "rgba(232, 222, 208, 0.75)" }}
        >
          {t(lang, "hero_extra")}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: ready ? 1.4 : 0, duration: 1 }}
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
