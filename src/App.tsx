import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

/**
 * Two pages (Czech "/" and Vietnamese "/vn") plus a 404, so no router library:
 * the language provider owns the URL. Kept deliberately small: no query client,
 * toasts, tooltips, motion or head library either.
 */
const HOME_PATHS = new Set(["/", "/vn", "/vn/", "/index.html"]);
const ALIASES: Record<string, string> = { "/cz": "/", "/cs": "/", "/vi": "/vn", "/cz/": "/", "/cs/": "/", "/vi/": "/vn" };

const App = () => {
  // Při build-time prerenderu (entry-ssg) není window; cestu dodá globál.
  const rawPath =
    typeof window === "undefined"
      ? ((globalThis as { __ANTAM_SSG_PATH__?: string }).__ANTAM_SSG_PATH__ ?? "/")
      : window.location.pathname;
  const path = rawPath.toLowerCase();
  const alias = ALIASES[path];
  if (alias && typeof window !== "undefined") {
    window.history.replaceState(null, "", alias + window.location.hash);
  }
  const isHome = Boolean(alias) || HOME_PATHS.has(path);
  return <LanguageProvider>{isHome ? <Index /> : <NotFound />}</LanguageProvider>;
};

export default App;
