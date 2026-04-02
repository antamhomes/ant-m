const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-gradient-dark border-t border-primary-foreground/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-display text-xl font-semibold text-primary-foreground">
            DAU AN <span className="text-gradient-gold">s.r.o.</span>
          </p>
          <p className="font-body text-sm text-primary-foreground/40 mt-1">
            Kompletní správa bytů pro Airbnb
          </p>
        </div>
        <div className="flex gap-8">
          <a href="#jak-to-funguje" className="font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">
            Jak to funguje
          </a>
          <a href="#kontakt" className="font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">
            Kontakt
          </a>
        </div>
        <p className="font-body text-xs text-primary-foreground/30">
          © 2026 DAU AN s.r.o. Všechna práva vyhrazena.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
