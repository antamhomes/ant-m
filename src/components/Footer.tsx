import { Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import logoAsset from "@/assets/antam-logo.png.asset.json";

const Footer = () => {
  const { lang } = useLanguage();

  return (
    <footer className="bg-gradient-dark border-t border-primary-foreground/10 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top: brand + nav + contact */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-10 border-b border-primary-foreground/10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src={logoAsset.url}
                alt="antam homes"
                className="h-14 w-14 rounded-full object-cover ring-1 ring-gold/30"
                width={112}
                height={112}
              />
              <p className="font-display text-2xl font-semibold text-primary-foreground lowercase tracking-tight">
                antam <span className="text-gold">homes</span>
              </p>
            </div>
            <p className="font-body text-sm text-primary-foreground/55 mt-3 max-w-sm leading-relaxed">
              {t(lang, "footer_desc")}
            </p>
          </div>

          {/* Nav links */}
          <div className="md:col-span-3">
            <p className="font-body text-[11px] text-gold-deep tracking-[0.25em] uppercase font-semibold mb-4">
              {lang === "cs" ? "Web" : "Trang web"}
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href="#jak-zacina" className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "footer_link_how")}
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
            <p className="font-body text-[11px] text-gold-deep tracking-[0.25em] uppercase font-semibold mb-4">
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
        <div className="pt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
          <a
            href="/gdpr-informacni-memorandum.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-primary-foreground/55 hover:text-gold transition-colors underline underline-offset-4 decoration-primary-foreground/20 hover:decoration-gold"
          >
            {lang === "cs" ? "Informační memorandum (GDPR)" : "Thông tin xử lý dữ liệu (GDPR)"}
          </a>
          <a
            href="/vop-majitele-nemovitosti.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-primary-foreground/55 hover:text-gold transition-colors underline underline-offset-4 decoration-primary-foreground/20 hover:decoration-gold"
          >
            {lang === "cs" ? "Všeobecné obchodní podmínky" : "Điều khoản chung"}
          </a>
          <a
            href="/formular-odstoupeni-od-smlouvy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-primary-foreground/55 hover:text-gold transition-colors underline underline-offset-4 decoration-primary-foreground/20 hover:decoration-gold"
          >
            {lang === "cs" ? "Formulář pro odstoupení od smlouvy" : "Mẫu đơn rút khỏi hợp đồng"}
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
