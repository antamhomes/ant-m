import { createContext, useContext, useMemo, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Language = "cs" | "vi";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "cs",
  toggleLang: () => {},
});

const VI_PREFIX = "/vn";

const langFromPath = (pathname: string): Language =>
  pathname.toLowerCase().startsWith(VI_PREFIX) ? "vi" : "cs";

/**
 * Language is derived from the URL (`/` = Czech, `/vn` = Vietnamese) so that
 * refreshing or sharing a link keeps the chosen language and the canonical /
 * hreflang tags always match the address bar. Must be rendered inside the
 * router.
 */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = langFromPath(location.pathname);

  const value = useMemo<LanguageContextType>(
    () => ({
      lang,
      toggleLang: () => {
        const target = lang === "cs" ? VI_PREFIX : "/";
        // Keep the current section anchor (e.g. #kalkulacka) when switching.
        navigate({ pathname: target, hash: location.hash });
      },
    }),
    [lang, location.hash, navigate]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
