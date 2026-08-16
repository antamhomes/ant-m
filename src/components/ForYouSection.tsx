import Reveal from "@/components/Reveal";
import ReasonsScroll from "@/components/ReasonsScroll";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/** "This is for you if…" — the reader recognises their own situation before we talk numbers.
 *  The reasons themselves are a scroll-driven single column (see ReasonsScroll). */
const ForYouSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="pro-koho" className="section bg-secondary scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "foryou_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "foryou_title1")}
            <span className="text-gradient-gold">{t(lang, "foryou_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "foryou_desc")}</p>
        </Reveal>

        {/* Phones: 3 rem section padding + 4 rem here = 7 rem (pb-28), so the sticky CTA never sits on the last open card. */}
        <div className="pb-16 sm:pb-0">
          <ReasonsScroll />
        </div>
      </div>
    </section>
  );
};

export default ForYouSection;
