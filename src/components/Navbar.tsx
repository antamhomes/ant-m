import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Wordmark from "@/components/Wordmark";
import { t, type TranslationKey } from "@/i18n/translations";
import { useSplashDone } from "@/hooks/use-splash-done";

const NAV_LINKS: { href: string; key: TranslationKey }[] = [
  { href: "#kalkulacka", key: "nav_calculator" },
  { href: "#portfolio", key: "nav_portfolio" },
  { href: "#jak-zacina", key: "nav_howItWorks" },
  { href: "#kdo-jsme", key: "nav_about" },
  { href: "#faq", key: "nav_faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();
  const ready = useSplashDone();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update <html lang> attribute
  useEffect(() => {
    document.documentElement.lang = lang === "cs" ? "cs" : "vi";
  }, [lang]);

  // Close the mobile menu on Escape and lock body scroll while it is open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  const LangSwitch = () => (
    <div
      className={`inline-flex items-center rounded-full border ${
        solid ? "border-border bg-card/60" : "border-primary-foreground/20 bg-transparent"
      } overflow-hidden`}
    >
      <button
        onClick={() => lang !== "cs" && toggleLang()}
        className={`px-2.5 py-1 text-[11px] font-body font-semibold tracking-wider uppercase transition-colors ${
          lang === "cs"
            ? solid ? "bg-gold/15 text-gold-deep" : "bg-gold/15 text-gold"
            : solid
              ? "text-muted-foreground hover:text-foreground"
              : "text-primary-foreground/60 hover:text-primary-foreground"
        }`}
        aria-pressed={lang === "cs"}
      >
        CZ
      </button>
      <span className={`w-px h-4 ${solid ? "bg-border" : "bg-primary-foreground/20"}`} />
      <button
        onClick={() => lang !== "vi" && toggleLang()}
        className={`px-2.5 py-1 text-[11px] font-body font-semibold tracking-wider uppercase transition-colors ${
          lang === "vi"
            ? solid ? "bg-gold/15 text-gold-deep" : "bg-gold/15 text-gold"
            : solid
              ? "text-muted-foreground hover:text-foreground"
              : "text-primary-foreground/60 hover:text-primary-foreground"
        }`}
        aria-pressed={lang === "vi"}
      >
        VI
      </button>
    </div>
  );

  return (
    <nav
      data-enter=""
      style={{ "--enter-y": "-100%", "--enter-delay": "0.3s", "--enter-dur": "0.7s" } as React.CSSProperties}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${ready ? "is-ready" : ""} ${
        solid
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
      aria-label={lang === "cs" ? "Hlavní navigace" : "Điều hướng chính"}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a
          href="#"
          onClick={() => setMenuOpen(false)}
          className="flex items-center"
          aria-label="Antam Homes"
        >
          <Wordmark on={solid ? "light" : "dark"} size="md" />
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`font-body text-sm transition-colors ${
                solid ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/75 hover:text-primary-foreground"
              }`}
            >
              {t(lang, l.key)}
            </a>
          ))}

          <LangSwitch />

          <a
            href="#kontakt"
            className={`btn px-5 py-2.5 text-xs ${solid ? "btn-primary" : "btn-primary-inverse"}`}
          >
            {t(lang, "nav_freeConsultation")}
          </a>
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <LangSwitch />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={t(lang, menuOpen ? "nav_menu_close" : "nav_menu_open")}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
              solid
                ? "border-border text-foreground hover:bg-muted"
                : "border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10"
            }`}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
          <div
            id="mobile-menu"
            className="menu-in lg:hidden border-t border-border bg-background/98 backdrop-blur-md"
          >
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col">
              {[...NAV_LINKS, { href: "#kontakt", key: "nav_contact" as TranslationKey }].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-body text-base text-foreground py-3 border-b border-border/60 last:border-b-0"
                >
                  {t(lang, l.key)}
                </a>
              ))}
              <a
                href="#kontakt"
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary mt-4 w-full"
              >
                {t(lang, "nav_freeConsultation")}
              </a>
            </div>
          </div>
      )}
    </nav>
  );
};

export default Navbar;
