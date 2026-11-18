import { useEffect } from "react";

/**
 * 404. Hosting na neznámou adresu vrací stránku s kódem 200, proto si ji
 * označíme noindex sami: vyhledávače ji pak nezařadí jako slabou kopii webu.
 */
const NotFound = () => {
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", window.location.pathname);
    document.title = "Stránka nenalezena | Antam Homes";
    let m = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!m) {
      m = document.createElement("meta");
      m.name = "robots";
      document.head.appendChild(m);
    }
    m.content = "noindex, follow";
    document.head.querySelector('link[rel="canonical"]')?.remove();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Tahle stránka neexistuje.</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Zpět na úvod
        </a>
      </div>
    </div>
  );
};

export default NotFound;
