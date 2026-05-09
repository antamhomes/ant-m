import { Mail, MapPin, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const Footer = () => {
  const { lang } = useLanguage();

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
          </div>

          {/* Nav links */}
          <div className="md:col-span-3">
            <p className="font-body text-[11px] text-gold tracking-[0.25em] uppercase mb-4">
              {lang === "cs" ? "Web" : "Trang web"}
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href="#jak-zacina" className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
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

        {/* Legal documents */}
        <div className="pt-6 flex flex-col md:flex-row gap-3 md:gap-6 items-center md:items-start justify-center md:justify-start">
          <a
            href="/gdpr-informacni-memorandum.pdf"
            download
            className="inline-flex items-center gap-2 text-xs text-primary-foreground/65 hover:text-gold transition-colors font-body tracking-wide"
          >
            <Download className="w-3.5 h-3.5" />
            {lang === "cs"
              ? "Informační memorandum o zpracování osobních údajů (GDPR)"
              : "Bản ghi nhớ thông tin về xử lý dữ liệu cá nhân (GDPR)"}
          </a>
          <a
            href="/vop-majitele-nemovitosti.pdf"
            download
            className="inline-flex items-center gap-2 text-xs text-primary-foreground/65 hover:text-gold transition-colors font-body tracking-wide"
          >
            <Download className="w-3.5 h-3.5" />
            {lang === "cs"
              ? "Všeobecné obchodní podmínky pro majitele nemovitostí"
              : "Điều khoản và điều kiện chung cho chủ sở hữu bất động sản"}
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
