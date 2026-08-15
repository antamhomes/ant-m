import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import heroImg from "@/assets/hero-bedroom.webp";
import heroImgSm from "@/assets/hero-bedroom-1280.webp";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-body text-[0.78rem] sm:text-sm tracking-[0.22em] uppercase mb-5 sm:mb-6"
          style={{ color: "#C2A46D" }}
        >
          {t(lang, "hero_subtitle")}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.1] tracking-[-0.02em] mb-5 sm:mb-6 text-balance"
          style={{ color: "#F7F1E8" }}
        >
          {t(lang, "hero_title1")}
          <br />
          {t(lang, "hero_title2")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-body text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto"
          style={{ color: "#E8DED0" }}
        >
          {t(lang, "hero_desc")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center"
        >
          <a
            href="#kalkulacka"
            onClick={() => trackEvent("cta_click", { location: "hero", target: "calculator" })}
            className="font-body inline-flex items-center justify-center px-7 py-3.5 text-sm sm:text-[0.95rem] font-medium tracking-[0.02em] rounded-full border transition-colors duration-300"
            style={{
              backgroundColor: "#F4EBDD",
              color: "#1E1A15",
              borderColor: "#F4EBDD",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.borderColor = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F4EBDD";
              e.currentTarget.style.borderColor = "#F4EBDD";
            }}
          >
            {t(lang, "hero_cta")}
          </a>
          <a
            href="#kontakt"
            onClick={() => trackEvent("cta_click", { location: "hero", target: "contact" })}
            className="font-body inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-[0.95rem] font-medium tracking-[0.02em] rounded-full border transition-colors duration-300"
            style={{
              color: "#F7F1E8",
              borderColor: "rgba(247, 241, 232, 0.35)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(247, 241, 232, 0.10)";
              e.currentTarget.style.borderColor = "rgba(247, 241, 232, 0.65)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "rgba(247, 241, 232, 0.35)";
            }}
          >
            {t(lang, "hero_cta2")}
            <span className="ml-2" style={{ color: "#C2A46D" }} aria-hidden="true">→</span>
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
