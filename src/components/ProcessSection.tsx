import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const numberLabels = ["01", "02", "03", "04"];
const titleKeys = ["step1_title", "step2_title", "step3_title", "step4_title"] as const;
const descKeys = ["step1_desc", "step2_desc", "step3_desc", "step4_desc"] as const;

const ProcessSection = () => {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "end 0.4"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], reduce ? ["100%", "100%"] : ["0%", "100%"]);

  return (
    <section id="jak-zacina" style={{ scrollMarginTop: "-40px" }} className="py-16 md:py-20 px-6 bg-gradient-dark">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "process_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary-foreground mb-6">
            {t(lang, "process_title")}
          </h2>
        </motion.div>

        <div ref={ref} className="relative max-w-4xl mx-auto">
          {/* Track line — left on mobile, center on desktop */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-2 bottom-2 w-px bg-primary-foreground/15" />
          {/* Filling gold line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-2 w-px bg-gradient-to-b from-gold/80 via-gold to-gold/40 origin-top"
          />

          <ul className="space-y-10 md:space-y-20">
            {numberLabels.map((num, index) => {
              const isRight = index % 2 === 1;
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative pl-20 md:pl-0 md:grid md:grid-cols-2 md:gap-16 md:items-center"
                >
                  {/* Node dot */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-3 -translate-x-1/2 w-3 h-3 rounded-full bg-gold ring-4 ring-charcoal" />

                  <div className={isRight ? "md:col-start-2 md:pl-12" : "md:col-start-1 md:pr-12 md:text-right"}>
                    <div
                      className={`font-display text-5xl md:text-7xl font-light text-gradient-gold leading-none mb-3 tabular-nums ${
                        isRight ? "" : "md:ml-auto"
                      }`}
                    >
                      {num}
                    </div>
                    <span className="font-body text-[11px] tracking-[0.3em] uppercase text-gold/70 mb-2 block">
                      {lang === "cs" ? "Krok" : "Bước"}
                    </span>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-primary-foreground mb-2">
                      {t(lang, titleKeys[index])}
                    </h3>
                    <p className="font-body text-primary-foreground/65 text-sm md:text-[15px] leading-relaxed max-w-md md:inline-block">
                      {t(lang, descKeys[index])}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="text-center mt-12 md:mt-16">
          <a
            href="#kontakt"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body font-medium text-[13px] tracking-[0.15em] uppercase rounded-sm hover:bg-charcoal border border-primary transition-all"
          >
            {t(lang, "process_cta")}
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
