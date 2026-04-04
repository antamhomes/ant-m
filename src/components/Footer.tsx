import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const Footer = () => {
  const { lang } = useLanguage();

  return (
    <footer className="py-12 px-6 bg-gradient-dark border-t border-primary-foreground/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-display text-xl font-semibold text-primary-foreground">
            DAU AN <span className="text-gradient-gold">s.r.o.</span>
          </p>
          <p className="font-body text-sm text-primary-foreground/40 mt-1">
            {t(lang, "footer_desc")}
          </p>
        </div>
        <div className="flex gap-8">
          <a href="#jak-to-funguje" className="font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">
            {t(lang, "nav_howItWorks")}
          </a>
          <a href="#kontakt" className="font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">
            {lang === "cs" ? "Kontakt" : "Liên hệ"}
          </a>
        </div>
        <p className="font-body text-xs text-primary-foreground/30">
          {t(lang, "footer_rights")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
