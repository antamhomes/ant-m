import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Language = "cs" | "vi";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  /** Client-side navigation to a language URL (keeps the #anchor). */
  goTo: (path: "/" | "/vn") => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "cs",
  toggleLang: () => {},
  goTo: () => {},
});

const VI_PREFIX = "/vn";

export const langFromPath = (pathname: string): Language =>
  pathname.toLowerCase().startsWith(VI_PREFIX) ? "vi" : "cs";

/**
 * Language is derived from the URL (`/` = Czech, `/vn` = Vietnamese) so that
 * refreshing or sharing a link keeps the chosen language and the canonical /
 * hreflang tags always match the address bar. Two routes only, so plain
 * history.pushState replaces a router library.
 */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined"
      ? ((globalThis as { __ANTAM_SSG_PATH__?: string }).__ANTAM_SSG_PATH__ ?? "/")
      : window.location.pathname
  );

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goTo = useCallback((path: "/" | "/vn") => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path + window.location.hash);
      setPathname(path);
    }
  }, []);

  const lang = langFromPath(pathname);
  const value = useMemo<LanguageContextType>(
    () => ({
      lang,
      goTo,
      toggleLang: () => goTo(lang === "cs" ? VI_PREFIX : "/"),
    }),
    [lang, goTo]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
