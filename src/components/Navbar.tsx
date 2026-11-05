import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Wordmark from "@/components/Wordmark";
import { t, type TranslationKey } from "@/i18n/translations";
import { useSplashDone } from "@/hooks/use-splash-done";
import { pathFor, sectionHref, type PageKey } from "@/lib/pages";

/**
 * Navigace od 2. 11. 2026: dvě stránky pro dva lidi (Správa, Vlastní provoz),
 * kalkulačka jako kotva (Kdo jsme pryč 3. 11. 2026), Poslat byt jako tlačítko. Odkaz na sekci
 * z jiné stránky dostane cestu (lib/pages.sectionHref); na vlastní stránce
 * zůstane kotva. Aktuální stránka je označená aria-current.
 */
type NavLink = { key: TranslationKey; page?: PageKey; section?: string };
/** 5. 11. 2026: nabídka nájmu je homepage; Správa z navigace pryč. Vlastní
 *  provoz zůstává jako stránka pro jiného člověka, odkaz jen v patičce. */
const NAV_LINKS: NavLink[] = [
  { key: "nav_jak", section: "jak" },
  { key: "nav_nabidka", section: "nabidka" },
  { key: "nav_splatka", section: "splatka" },
  { key: "nav_otazky", section: "faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, page } = useLanguage();
  const ready = useSplashDone();
  const hrefOf = (l: NavLink) => (l.page ? pathFor(l.page, lang) : sectionHref(l.section!, page, lang));
  const isCurrent = (l: NavLink) => Boolean(l.page && l.page === page);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.lang = "cs";
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

  // 5. 11. 2026: hero je na papíru, ne na tmavé fotce, takže navigace jede
  // inkoustem od první obrazovky. Tmavý start zůstává jen stránkám s fotkou.
  const solid = scrolled || menuOpen || page === "home";

  return (
    <nav
      data-enter=""
      style={{ "--enter-y": "-100%", "--enter-delay": "0.3s", "--enter-dur": "0.7s" } as React.CSSProperties}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${ready ? "is-ready" : ""} ${
        solid
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
      aria-label="Hlavní navigace"
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a
          href={pathFor("home", lang)}
          onClick={() => setMenuOpen(false)}
          className="flex items-center"
          aria-label="Antam"
        >
          <Wordmark on={solid ? "light" : "dark"} size="md" />
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l.key}
              href={hrefOf(l)}
              aria-current={isCurrent(l) ? "page" : undefined}
              className={`font-body text-sm transition-colors ${
                isCurrent(l)
                  ? solid ? "text-foreground underline underline-offset-[6px] decoration-gold" : "text-primary-foreground underline underline-offset-[6px] decoration-gold"
                  : solid ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/75 hover:text-primary-foreground"
              }`}
            >
              {t(lang, l.key)}
            </a>
          ))}

          <a
            href="#kontakt"
            className={`btn px-5 py-2.5 text-xs ${solid ? "btn-primary" : "btn-primary-inverse"}`}
          >
            {t(lang, "nav_freeConsultation")}
          </a>
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-2">
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
              {[...NAV_LINKS, { key: "nav_contact" as TranslationKey, section: "kontakt" }].map((l) => (
                <a
                  key={l.key}
                  href={hrefOf(l)}
                  aria-current={isCurrent(l) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`font-body text-base py-3 border-b border-border/60 last:border-b-0 ${isCurrent(l) ? "text-gold-deep" : "text-foreground"}`}
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
