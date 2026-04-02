import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

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
            DAU AN{" "}
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
            Jak to funguje
          </a>
          <a
            href="#kontakt"
            className="px-6 py-2.5 bg-gold text-accent-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:brightness-110 transition-all"
          >
            Konzultace zdarma
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
