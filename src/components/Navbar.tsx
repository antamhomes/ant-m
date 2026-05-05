import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { lang, toggleLang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update <html lang> attribute
  useEffect(() => {
    document.documentElement.lang = lang === "cs" ? "cs" : "vi";
  }, [lang]);

  const LangSwitch = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`inline-flex items-center rounded-full border ${
        scrolled ? "border-border bg-card/60" : "border-primary-foreground/20 bg-transparent"
      } overflow-hidden`}
    >
      <button
        onClick={() => lang !== "cs" && toggleLang()}
        className={`px-2.5 py-1 text-[11px] font-body font-semibold tracking-wider uppercase transition-colors ${
          lang === "cs"
            ? "bg-gold/15 text-gold"
            : scrolled
              ? "text-muted-foreground hover:text-foreground"
              : "text-primary-foreground/60 hover:text-primary-foreground"
        }`}
        aria-pressed={lang === "cs"}
      >
        CZ
      </button>
      <span className={`w-px h-4 ${scrolled ? "bg-border" : "bg-primary-foreground/20"}`} />
      <button
        onClick={() => lang !== "vi" && toggleLang()}
        className={`px-2.5 py-1 text-[11px] font-body font-semibold tracking-wider uppercase transition-colors ${
          lang === "vi"
            ? "bg-gold/15 text-gold"
            : scrolled
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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="font-display text-lg md:text-xl font-semibold tracking-tight lowercase">
          <span className={scrolled ? "text-foreground" : "text-primary-foreground"}>
            antam{" "}
          </span>
          <span className="text-gold">homes</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          <a
            href="#jak-zacina"
            className={`font-body text-sm transition-colors ${
              scrolled ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/75 hover:text-primary-foreground"
            }`}
          >
            {t(lang, "nav_howItWorks")}
          </a>

          <a
            href="/portfolio"
            className={`font-body text-sm transition-colors ${
              scrolled ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/75 hover:text-primary-foreground"
            }`}
          >
            Portfolio
          </a>

          <LangSwitch />

          <a
            href="#kontakt"
            className={`px-5 py-2.5 font-body font-semibold text-xs tracking-wider uppercase rounded-sm transition-all ${
              scrolled
                ? "bg-primary text-primary-foreground hover:brightness-110"
                : "bg-primary-foreground text-primary hover:brightness-95"
            }`}
          >
            {t(lang, "nav_freeConsultation")}
          </a>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <LangSwitch compact />
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
