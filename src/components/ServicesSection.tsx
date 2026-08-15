import { motion } from "framer-motion";
import { Sofa, Camera, MessageSquare, Sparkles, LineChart, FileBarChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { reveal, revealDelayed, stagger } from "@/lib/motion";

const items: { icon: typeof Sofa; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: Sofa,          titleKey: "svc1_title", descKey: "svc1_desc" },
  { icon: Camera,        titleKey: "svc2_title", descKey: "svc2_desc" },
  { icon: LineChart,     titleKey: "svc3_title", descKey: "svc3_desc" },
  { icon: MessageSquare, titleKey: "svc4_title", descKey: "svc4_desc" },
  { icon: Sparkles,      titleKey: "svc5_title", descKey: "svc5_desc" },
  { icon: FileBarChart,  titleKey: "svc6_title", descKey: "svc6_desc" },
];

const ServicesSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="sluzby" className="section relative bg-gradient-dark border-y border-gold/15 overflow-hidden scroll-mt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-1/3 h-[60%] opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(var(--gold) / 0.18), transparent 60%)",
        }}
      />
      <div className="relative container-wide">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "services_label")}</p>
          <h2 className="h-section text-primary-foreground">{t(lang, "services_title")}</h2>
          <p className="lead lead-on-dark">{t(lang, "services_desc")}</p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9 md:gap-y-12">
          {items.map(({ icon: Icon, titleKey, descKey }, index) => (
            <motion.article key={titleKey} {...revealDelayed(stagger(index))} className="group">
              <div className="w-11 h-11 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-gold transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg md:text-xl font-semibold text-primary-foreground mb-2 leading-snug">
                {t(lang, titleKey)}
              </h3>
              <p className="font-body text-[15px] text-primary-foreground/65 leading-relaxed max-w-[32ch] text-pretty">
                {t(lang, descKey)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
