import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const AboutSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="o-nas" className="relative py-16 md:py-24 px-6 bg-background overflow-hidden">
      {/* Decorative accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--gold)/0.06),_transparent_60%)]"
      />
      <svg
        aria-hidden
        viewBox="0 0 600 200"
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-[140%] sm:w-[700px] max-w-none opacity-[0.07] text-gold"
      >
        <path d="M0 100 Q150 0 300 100 T600 100" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M0 130 Q150 30 300 130 T600 130" stroke="currentColor" strokeWidth="0.8" fill="none" />
      </svg>

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold-deep font-body text-sm tracking-[0.3em] uppercase font-semibold mb-4">
            {t(lang, "about_label")}
          </p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-px w-12 bg-gold/40" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            {t(lang, "about_title")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <p className="font-body text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
            {t(lang, "about_p1")}
          </p>
          <p className="font-body text-muted-foreground text-base md:text-lg leading-relaxed mb-10">
            {t(lang, "about_p2")}
          </p>

          {/* Závěrečná teze – centrovaný "pull-quote" */}
          <div className="relative mx-auto max-w-2xl px-6 py-8 md:py-10">
            <span className="absolute left-1/2 -translate-x-1/2 -top-px h-px w-24 bg-gold/50" />
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-px h-px w-24 bg-gold/50" />
            <p className="font-display italic text-foreground/90 text-lg md:text-2xl leading-relaxed">
              {t(lang, "about_p3")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
