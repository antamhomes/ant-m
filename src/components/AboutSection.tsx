import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/Reveal";
import Wordmark from "@/components/Wordmark";
import { t } from "@/i18n/translations";

/**
 * "Kdo za tím stojí" — a face and three sentences. The photo is a placeholder
 * until Vuong supplies one: drop `src/assets/team.jpg` and swap the block below.
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

        <div className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-8 md:gap-12 items-center max-w-4xl mx-auto">
          {/* Photo placeholder — replace with <img src={teamPhoto} … /> */}
          <Reveal delay={0.05}
            className="hidden md:flex aspect-[4/5] rounded-md bg-gradient-dark border border-gold/20 items-end p-5 shadow-[0_30px_60px_-30px_hsl(var(--charcoal)/0.45)]"
            aria-hidden="true"
          >
            <Wordmark on="dark" size="sm" className="opacity-90" />
          </Reveal>

          <Reveal delay={0.1}>
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
