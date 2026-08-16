import { Sofa, Camera, MessageSquare, Sparkles, LineChart, FileBarChart } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

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
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "services_label")}</p>
          <h2 className="h-section text-primary-foreground">{t(lang, "services_title")}</h2>
          <p className="lead lead-on-dark">{t(lang, "services_desc")}</p>
        </Reveal>

        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-7 sm:gap-x-10 sm:gap-y-9 md:gap-y-12">
          {items.map(({ icon: Icon, titleKey, descKey }, index) => (
            <Reveal as="article" key={titleKey} delay={stagger(index)} className="group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center mb-3 sm:mb-4">
                <Icon className="w-5 h-5 text-gold transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-[15px] sm:text-lg md:text-xl font-semibold text-primary-foreground mb-1.5 sm:mb-2 leading-snug text-balance">
                {t(lang, titleKey)}
              </h3>
              <p className="font-body text-[13px] sm:text-[15px] text-primary-foreground/65 leading-normal sm:leading-relaxed max-w-[32ch] text-pretty">
                {t(lang, descKey)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
