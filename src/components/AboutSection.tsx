import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const AboutSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="o-nas" className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "about_label")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
            {t(lang, "about_title")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
            {t(lang, "about_p1")}
          </p>
          <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
            {t(lang, "about_p2")}
          </p>
          <p className="font-body text-muted-foreground text-lg leading-relaxed">
            {t(lang, "about_p3")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
