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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="font-display text-xl font-semibold">
          <span className={scrolled ? "text-foreground" : "text-primary-foreground"}>
            ANTAM{" "}
          </span>
          <span className="text-gradient-gold">s.r.o.</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#jak-to-funguje"
            className={`font-body text-sm tracking-wide transition-colors ${
              scrolled ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
            }`}
          >
            {t(lang, "nav_howItWorks")}
          </a>

          <a
            href="#portfolio"
            className={`font-body text-sm tracking-wide transition-colors ${
              scrolled ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
            }`}
          >
            Portfolio
          </a>

          <button
            onClick={toggleLang}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-body font-semibold tracking-wider uppercase transition-all border ${
              scrolled
                ? "border-border text-muted-foreground hover:text-foreground hover:border-gold/50"
                : "border-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground/40"
            }`}
          >
            <span className="text-sm">{lang === "cs" ? "🇻🇳" : "🇨🇿"}</span>
            {lang === "cs" ? "VN" : "CZ"}
          </button>

          <a
            href="#kontakt"
            className="px-6 py-2.5 bg-gold text-accent-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:brightness-110 transition-all"
          >
            {t(lang, "nav_freeConsultation")}
          </a>
        </div>

        {/* Mobile: just the toggle + CTA */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleLang}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-body font-semibold tracking-wider uppercase transition-all border ${
              scrolled
                ? "border-border text-muted-foreground"
                : "border-primary-foreground/20 text-primary-foreground/70"
            }`}
          >
            <span className="text-sm">{lang === "cs" ? "🇻🇳" : "🇨🇿"}</span>
            {lang === "cs" ? "VN" : "CZ"}
          </button>
          <a
            href="#kontakt"
            className="px-4 py-2 bg-gold text-accent-foreground font-body font-semibold text-xs tracking-wider uppercase rounded-sm"
          >
            {t(lang, "nav_freeConsultation")}
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
