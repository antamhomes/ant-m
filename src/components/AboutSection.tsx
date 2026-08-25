import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/Reveal";
import { t } from "@/i18n/translations";

/**
 * "Kdo za tím stojí" — three sentences, one centred column. The photo slot is
 * removed for now; when Vuong supplies a photo, bring back the two-column grid
 * (md:grid-cols-[minmax(0,320px)_1fr]) with <img src={teamPhoto} … /> on the left.
 * REVIEW: about_p1–p3 (CZ + VI) are drafts to be replaced with Vuong's own words.
 */
const AboutSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="kdo-jsme" className="section bg-background scroll-mt-16">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "about_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "about_title")}</h2>
        </Reveal>

        <div className="max-w-2xl mx-auto">
          <Reveal delay={0.05}>
            <p className="font-body text-[17px] md:text-lg text-foreground leading-relaxed mb-5 text-pretty">
              {t(lang, "about_p1")}
            </p>
            <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed mb-5 text-pretty">
              {t(lang, "about_p2")}
            </p>
            <p className="font-display italic text-lg md:text-xl text-foreground/90 leading-relaxed border-l-2 border-gold/60 pl-4">
              {t(lang, "about_p3")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
