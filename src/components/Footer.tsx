import { useState } from "react";
import { FileDown, Loader2, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const Footer = () => {
  const { lang, toggleLang } = useLanguage();
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
    <footer className="bg-gradient-dark border-t border-primary-foreground/10 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top: brand + nav + contact */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-10 border-b border-primary-foreground/10">
          {/* Brand */}
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-semibold text-primary-foreground lowercase tracking-tight">
              antam <span className="text-gold">homes</span>
            </p>
            <p className="font-body text-sm text-primary-foreground/55 mt-3 max-w-sm leading-relaxed">
              {t(lang, "footer_desc")}
            </p>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 border border-primary-foreground/20 text-primary-foreground/85 font-body font-medium text-xs tracking-wider uppercase rounded-sm hover:border-gold/50 hover:text-primary-foreground transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              {t(lang, "footer_brochure")}
            </button>
          </div>

          {/* Nav links */}
          <div className="md:col-span-3">
            <p className="font-body text-[11px] text-gold tracking-[0.25em] uppercase mb-4">
              {lang === "cs" ? "Web" : "Trang web"}
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href="#jak-to-funguje" className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "footer_link_how")}
                </a>
              </li>
              <li>
                <a href="#portfolio" className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "footer_link_portfolio")}
                </a>
              </li>
              <li>
                <a href="#sluzby" className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "footer_link_services")}
                </a>
              </li>
              <li>
                <a href="#kontakt" className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "footer_link_contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="font-body text-[11px] text-gold tracking-[0.25em] uppercase mb-4">
              {lang === "cs" ? "Kontakt" : "Liên hệ"}
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/75">
                <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <a href={`tel:${t(lang, "footer_phone")}`} className="hover:text-gold transition-colors font-body">
                  {t(lang, "footer_phone")}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/75">
                <Mail className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <a href={`mailto:${t(lang, "footer_email")}`} className="hover:text-gold transition-colors font-body">
                  {t(lang, "footer_email")}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/75">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="font-body">{t(lang, "footer_location")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-[12px] text-primary-foreground/45">
            <span>{t(lang, "footer_legal")}</span>
            <span className="hidden md:inline">·</span>
            <span>{t(lang, "footer_ico")}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="font-body text-[11px] tracking-[0.25em] uppercase text-primary-foreground/55 hover:text-gold transition-colors"
            >
              {lang === "cs" ? "CZ / VI" : "VI / CZ"}
            </button>
            <span className="text-primary-foreground/20">·</span>
            <p className="font-body text-[11px] text-primary-foreground/45">
              {t(lang, "footer_rights")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
