import { lazy, Suspense, useState } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SiteLock from "@/components/SiteLock";
import { SITE_LOCK_ENABLED, isUnlocked } from "@/lib/siteLock";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

/** Interní vyhodnocovač. Vlastní chunk, ať se do veřejného balíku nepřidává. */
const Nastroj = lazy(() => import("./pages/Nastroj.tsx"));
const TOOL_PATHS = new Set(["/nastroj", "/nastroj/", "/admin/nastroj", "/admin/nastroj/"]);

/**
 * Two pages (Czech "/" and Vietnamese "/vn") plus a 404, so no router library:
 * the language provider owns the URL. Kept deliberately small: no query client,
 * toasts, tooltips, motion or head library either.
 */
const HOME_PATHS = new Set(["/", "/vn", "/vn/", "/index.html"]);
const ALIASES: Record<string, string> = { "/cz": "/", "/cs": "/", "/vi": "/vn", "/cz/": "/", "/cs/": "/", "/vi/": "/vn" };

const App = () => {
  // Závora před spuštěním: při prerenderu (bez window) je vždy zamčeno,
  // takže do statického HTML nejde žádný obsah.
  const [unlocked, setUnlocked] = useState(() => !SITE_LOCK_ENABLED || isUnlocked());

  // Nástroj má vlastní přihlášení (Supabase) a závoru webu obchází: závora je
  // sdílené heslo v bundlu, ne autentizace. Oprávnění stejně vynucuje RLS.
  if (typeof window !== "undefined" && TOOL_PATHS.has(window.location.pathname.toLowerCase())) {
    return (
      <Suspense fallback={<div className="px-5 py-16 text-sm text-neutral-400">Načítám…</div>}>
        <Nastroj />
      </Suspense>
    );
  }

  if (!unlocked) return <SiteLock onUnlock={() => setUnlocked(true)} />;

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
