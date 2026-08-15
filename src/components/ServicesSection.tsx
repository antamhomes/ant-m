import { motion } from "framer-motion";
import { FileText, MessageSquare, Sparkles, LineChart, FileBarChart, Wrench } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { reveal, revealDelayed, stagger } from "@/lib/motion";

const items: { icon: typeof FileText; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: FileText,     titleKey: "svc1_title", descKey: "svc1_desc" },
  { icon: LineChart,    titleKey: "svc2_title", descKey: "svc2_desc" },
  { icon: MessageSquare,titleKey: "svc3_title", descKey: "svc3_desc" },
  { icon: Sparkles,     titleKey: "svc4_title", descKey: "svc4_desc" },
  { icon: Wrench,       titleKey: "svc5_title", descKey: "svc5_desc" },
  { icon: FileBarChart, titleKey: "svc6_title", descKey: "svc6_desc" },
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
      <div className="relative container-narrow">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "services_label")}</p>
          <h2 className="h-section text-primary-foreground">{t(lang, "services_title")}</h2>
          <p className="lead lead-on-dark">{t(lang, "services_desc")}</p>
        </motion.div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {items.map(({ icon: Icon, titleKey, descKey }, index) => (
            <motion.article
              key={titleKey}
              {...revealDelayed(stagger(index))}
              className="group grid grid-cols-[auto_1fr] gap-5 py-6 md:py-7 border-b border-primary-foreground/10 last:border-b-0 md:[&:nth-last-child(2)]:border-b-0"
            >
              <div className="shrink-0 pt-0.5">
                <Icon className="w-6 h-6 text-gold transition-transform duration-300 group-hover:scale-110" strokeWidth={1.4} />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-primary-foreground mb-1.5 leading-snug">
                  {t(lang, titleKey)}
                </h3>
                <p className="font-body text-[15px] md:text-base text-primary-foreground/70 leading-relaxed text-pretty">
                  {t(lang, descKey)}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
