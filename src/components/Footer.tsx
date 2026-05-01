import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const Footer = () => {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { generateBrochure } = await import("@/lib/generateBrochure");
      await generateBrochure(lang);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="py-12 px-6 bg-gradient-dark border-t border-primary-foreground/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-display text-xl font-semibold text-primary-foreground">
            ANTAM <span className="text-gradient-gold">s.r.o.</span>
          </p>
          <p className="font-body text-sm text-primary-foreground/40 mt-1">
            {t(lang, "footer_desc")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#jak-to-funguje" className="font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">
              {t(lang, "footer_link_how")}
            </a>
            <a href="#portfolio" className="font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">
              {t(lang, "footer_link_portfolio")}
            </a>
            <a href="#sluzby" className="font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">
              {t(lang, "footer_link_services")}
            </a>
            <a href="#kontakt" className="font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">
              {t(lang, "footer_link_contact")}
            </a>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-accent-foreground font-body font-semibold text-xs tracking-wider uppercase rounded-sm hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {t(lang, "footer_brochure")}
          </button>
        </div>

        <p className="font-body text-xs text-primary-foreground/30">
          {t(lang, "footer_rights")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
