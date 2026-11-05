import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { pathFor, resolvePath, type Language, type PageKey } from "@/lib/pages";

interface LanguageContextType {
  lang: Language;
  /** Která stránka je otevřená (home / sprava / vlastni-provoz); 404 se chová jako home. */
  page: PageKey;
  toggleLang: () => void;
  /** Client-side navigation (keeps the #anchor). */
  goTo: (path: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "cs",
  page: "home",
  toggleLang: () => {},
  goTo: () => {},
});

/** 5. 11. 2026: jen čeština. Funkce zůstává kvůli volajícím. */
export const langFromPath = (_pathname: string): Language => "cs";

/**
 * Language AND page are derived from the URL (`/` = Czech, `/vn` = Vietnamese;
 * `/sprava`, `/vlastni-provoz` and their `/vn/` twins are the subpages, see
 * lib/pages.ts) so that refreshing or sharing a link keeps both and the
 * canonical / hreflang tags always match the address bar. Six routes, so
 * plain history.pushState still replaces a router library.
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

  const goTo = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path + window.location.hash);
      setPathname(path);
      window.scrollTo(0, 0);
    }
  }, []);

  const resolved = resolvePath(pathname);
  const lang = resolved?.lang ?? langFromPath(pathname);
  const page = resolved?.page ?? "home";
  const value = useMemo<LanguageContextType>(
    () => ({
      lang,
      page,
      goTo,
      toggleLang: () => goTo(pathFor(page)),
    }),
    [lang, page, goTo]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
