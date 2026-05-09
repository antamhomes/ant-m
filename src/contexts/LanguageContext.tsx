import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "cs" | "vi";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "cs",
  toggleLang: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined" && window.location.pathname.toLowerCase().startsWith("/vn")) {
      return "vi";
    }
    return "cs";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      setLang(window.location.pathname.toLowerCase().startsWith("/vn") ? "vi" : "cs");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const toggleLang = () => setLang((prev) => (prev === "cs" ? "vi" : "cs"));

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
