import { ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * Slim closing band after the FAQ: one line, one sentence, one button back to
 * the form. For readers who researched all the way down.
 */
const FinalCtaSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="bg-gradient-dark border-t border-gold/15">
      <Reveal className="container-narrow py-14 md:py-16 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-medium text-primary-foreground leading-snug mb-3">
          {t(lang, "final_title")}
        </h2>
        <p className="font-body text-[15px] md:text-base text-primary-foreground/70 mb-7 max-w-md mx-auto text-pretty">
          {t(lang, "final_desc")}
        </p>
        <a
          href="#kontakt"
          onClick={() => trackEvent("cta_click", { location: "final", target: "contact" })}
          className="btn btn-primary-inverse"
        >
          {t(lang, "g_cta")}
          <ChevronRight className="w-4 h-4" />
        </a>
      </Reveal>
    </section>
  );
};

export default FinalCtaSection;
