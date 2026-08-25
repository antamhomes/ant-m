import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/Reveal";
import { t } from "@/i18n/translations";

/**
 * "Kdo za tím stojí" — one centred column: lead paragraph, body paragraphs
 * (empty keys are skipped, so the VI page can use fewer), closing quote.
 * The photo slot is removed for now; when Vuong supplies a photo, bring back
 * the two-column grid (md:grid-cols-[minmax(0,320px)_1fr]) with
 * <img src={teamPhoto} … /> on the left.
 * CZ copy is Vuong's own words; REVIEW: the VI paragraphs are still drafts.
 */
const BODY_KEYS = ["about_p2", "about_p3", "about_p4", "about_p5"] as const;

const AboutSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="kdo-jsme" className="section bg-background scroll-mt-16">
      <div className="container-narrow">
        {/* One article-like block: eyebrow, title, paragraphs and the quote all
           share the same left edge, and the whole column is centred on the page. */}
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="eyebrow mb-5">{t(lang, "about_label")}</p>
            <h2 className="h-section-sm text-foreground mb-6 md:mb-8">{t(lang, "about_title")}</h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="font-body text-[17px] md:text-lg text-foreground leading-relaxed mb-5 text-pretty">
              {t(lang, "about_p1")}
            </p>
            {BODY_KEYS.map((key) => {
              const text = t(lang, key);
              if (!text) return null;
              return (
                <p key={key} className="font-body text-base md:text-lg text-muted-foreground leading-relaxed mb-5 text-pretty">
                  {text}
                </p>
              );
            })}
            <p className="font-display italic text-lg md:text-xl text-foreground/90 leading-relaxed border-l-2 border-gold/60 pl-4">
              {t(lang, "about_quote")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
