import { motion } from "framer-motion";
import { Heart, Sparkles, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const cardIcons = [Heart, Sparkles, Building2];
const cardTitleKeys = ["about_card1_title", "about_card2_title", "about_card3_title"] as const;
const cardDescKeys = ["about_card1_desc", "about_card2_desc", "about_card3_desc"] as const;

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cardIcons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-accent/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {t(lang, cardTitleKeys[index])}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {t(lang, cardDescKeys[index])}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
