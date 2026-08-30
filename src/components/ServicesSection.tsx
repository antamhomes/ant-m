import { Sofa, Camera, MessageSquare, Sparkles, LineChart, FileBarChart } from "lucide-react";
import Reveal from "@/components/Reveal";
import ReviewsBlock from "@/components/ReviewsBlock";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: { icon: typeof Sofa; titleKey: TranslationKey }[] = [
  { icon: Sofa,          titleKey: "svc1_title" },
  { icon: Camera,        titleKey: "svc2_title" },
  { icon: LineChart,     titleKey: "svc3_title" },
  { icon: MessageSquare, titleKey: "svc4_title" },
  { icon: Sparkles,      titleKey: "svc5_title" },
  { icon: FileBarChart,  titleKey: "svc6_title" },
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
          <h2 className="h-section-sm text-primary-foreground">{t(lang, "services_title")}</h2>
          <p className="lead lead-on-dark">{t(lang, "services_desc")}</p>
        </Reveal>

        {/* Six areas as one row of words (patch 126): the descriptions repeated
            what the pricing stack and step 4 already say; the words are for scanning.
            Icons kept, one per word, so the row still reads as six things. */}
        <Reveal as="ul" delay={0.05} className="flex flex-wrap justify-center gap-x-5 gap-y-3 sm:gap-x-8 max-w-5xl mx-auto list-none m-0 p-0">
          {items.map(({ icon: Icon, titleKey }) => (
            <li key={titleKey} className="flex items-center gap-2 font-display text-[15px] sm:text-lg text-primary-foreground leading-none">
              <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gold shrink-0" strokeWidth={1.5} aria-hidden="true" />
              {t(lang, titleKey)}
            </li>
          ))}
        </Reveal>

        {/* One systems sentence for the reader who prices operational risk. */}
        <Reveal delay={0.15}>
          <p className="mt-8 md:mt-10 font-body text-[13px] text-primary-foreground/55 text-center leading-relaxed max-w-xl mx-auto text-pretty">
            {t(lang, "svc_systems")}
          </p>
        </Reveal>

        {/* Guest voices: the service quality an owner is really buying. */}
        <ReviewsBlock />
      </div>
    </section>
  );
};

export default ServicesSection;
