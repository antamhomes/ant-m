import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Wordmark from "@/components/Wordmark";
import { t } from "@/i18n/translations";

const Footer = () => {
  const { lang, goTo } = useLanguage();

  return (
    <footer className="bg-gradient-dark border-t border-primary-foreground/10 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 sm:pt-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top: brand + nav + contact */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-8 pb-8 md:pb-10 border-b border-primary-foreground/10">
          {/* Brand */}
          <div className="md:col-span-5">
            <p>
              <Wordmark on="dark" size="lg" />
            </p>
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
                <a href="#portfolio" className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
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
                <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <a href={`tel:${t(lang, "footer_phone").replace(/\s/g, "")}`} className="hover:text-gold transition-colors font-body">
                  {t(lang, "footer_phone")}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/75">
                <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <span className="font-body text-primary-foreground/50 text-xs block leading-none mb-0.5">
                    Tiếng Việt
                  </span>
                  <a href={`tel:${t(lang, "footer_office_phone").replace(/\s/g, "")}`} className="hover:text-gold transition-colors font-body">
                    {t(lang, "footer_office_phone")}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/75">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="font-body">{t(lang, "footer_location")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal documents */}
        <div className="pt-6 md:pt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
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

        {/* Operator identification (required for a business website) + language links */}
        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-body text-[11px] leading-relaxed text-primary-foreground/45 max-w-2xl">
              {t(lang, "footer_legal")}
            </p>
            <p className="font-body text-[11px] text-primary-foreground/45 mt-1">
              {t(lang, "footer_rights")}
              {t(lang, "footer_updated") ? ` · ${t(lang, "footer_updated")}` : ""}
            </p>
          </div>
          <nav aria-label={lang === "cs" ? "Jazyk" : "Ngôn ngữ"} className="flex justify-center md:justify-end gap-4 font-body text-xs">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); goTo("/"); }}
              className={lang === "cs" ? "text-gold" : "text-primary-foreground/55 hover:text-gold transition-colors"}
              aria-current={lang === "cs" ? "page" : undefined}
              hrefLang="cs"
            >
              {t(lang, "footer_lang_cs")}
            </a>
            <a
              href="/vn"
              onClick={(e) => { e.preventDefault(); goTo("/vn"); }}
              className={lang === "vi" ? "text-gold" : "text-primary-foreground/55 hover:text-gold transition-colors"}
              aria-current={lang === "vi" ? "page" : undefined}
              hrefLang="vi"
            >
              {t(lang, "footer_lang_vi")}
            </a>
          </nav>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
