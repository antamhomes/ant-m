import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

const StickyMobileCTA = () => {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Zobrazit po scrollu pod hero (~70 % viewportu)
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/0 pointer-events-none" />
      <a
        href="#kontakt"
        onClick={() => trackEvent("cta_click", { location: "sticky_mobile", target: "contact" })}
        className="btn btn-primary relative w-full py-3.5 shadow-lg shadow-charcoal/20"
      >
        {t(lang, "mobile_cta")}
        <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  );
};

export default StickyMobileCTA;