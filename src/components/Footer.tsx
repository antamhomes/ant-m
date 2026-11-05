import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Wordmark from "@/components/Wordmark";
import { t } from "@/i18n/translations";
import { pathFor, sectionHref } from "@/lib/pages";

const Footer = () => {
  const { lang, page } = useLanguage();

  return (
    <footer className="bg-gradient-dark border-t border-primary-foreground/10 pt-10 sm:pt-16 px-6 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))] md:pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="max-w-6xl mx-auto">
        {/* Top: brand + nav + contact */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-8 pb-8 md:pb-10 border-b border-primary-foreground/10">
          {/* Brand */}
          <div className="md:col-span-5">
            <p>
              <Wordmark on="dark" size="lg" />
            </p>
            <p className="font-body text-sm text-primary-foreground/70 mt-3 max-w-sm leading-relaxed">
              {t(lang, "footer_desc")}
            </p>
          </div>

          {/* Nav links */}
          <div className="md:col-span-3">
            <p className="font-body text-[12px] text-[#C2A46D] tracking-[0.22em] uppercase font-semibold mb-4">
              Web
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href={sectionHref("nabidka", page, lang)} className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "nav_nabidka")}
                </a>
              </li>
              <li>
                <a href={sectionHref("splatka", page, lang)} className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "nav_splatka")}
                </a>
              </li>
              <li>
                <a href={pathFor("vlastni-provoz", lang)} className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "lz_footer_own")}
                </a>
              </li>
              <li>
                <a href={sectionHref("kontakt", page, lang)} className="font-body text-sm text-primary-foreground/65 hover:text-gold transition-colors">
                  {t(lang, "footer_link_contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="font-body text-[12px] text-[#C2A46D] tracking-[0.22em] uppercase font-semibold mb-4">
              Kontakt
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
            className="font-body text-xs text-primary-foreground/70 hover:text-gold transition-colors underline underline-offset-4 decoration-primary-foreground/20 hover:decoration-gold"
          >
            Informační memorandum (GDPR)
          </a>
          <a
            href="/vop-majitele-nemovitosti.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-primary-foreground/70 hover:text-gold transition-colors underline underline-offset-4 decoration-primary-foreground/20 hover:decoration-gold"
          >
            Všeobecné obchodní podmínky
          </a>
          <a
            href="/formular-odstoupeni-od-smlouvy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-primary-foreground/70 hover:text-gold transition-colors underline underline-offset-4 decoration-primary-foreground/20 hover:decoration-gold"
          >
            Formulář pro odstoupení od smlouvy
          </a>
        </div>

        {/* Operator identification (required for a business website) */}
        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="font-body text-[11px] leading-relaxed text-primary-foreground/45 max-w-2xl">
              {t(lang, "footer_legal")}
            </p>
            <p className="font-body text-[11px] text-primary-foreground/45 mt-1">
              {t(lang, "footer_rights")}
              {t(lang, "footer_updated") ? ` · ${t(lang, "footer_updated")}` : ""}
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
