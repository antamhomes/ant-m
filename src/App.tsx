import { lazy, Suspense, useState } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SiteLock from "@/components/SiteLock";
import { SITE_LOCK_ENABLED, isUnlocked } from "@/lib/siteLock";
import Index from "./pages/Index.tsx";
import { resolvePath } from "@/lib/pages";
import NotFound from "./pages/NotFound.tsx";

/** Interní vyhodnocovač. Vlastní chunk, ať se do veřejného balíku nepřidává. */
const Nastroj = lazy(() => import("./pages/Nastroj.tsx"));
const TOOL_PATHS = new Set(["/nastroj", "/nastroj/", "/admin/nastroj", "/admin/nastroj/"]);

/** Průvodce příjezdem pro hosty (/guide, /guide/b01…b05). Vlastní chunk. */
const Guide = lazy(() => import("./pages/Guide.tsx"));
const isGuidePath = (p: string) => p === "/guide" || p.startsWith("/guide/");

/**
 * Six public routes (see lib/pages.ts: home, /sprava, /vlastni-provoz, each in
 * Czech and Vietnamese) plus a 404, so no router library: the language
 * provider owns the URL. Kept deliberately small: no query client, toasts,
 * tooltips, motion or head library either.
 */
const Sprava = lazy(() => import("./pages/Sprava.tsx"));
const VlastniProvoz = lazy(() => import("./pages/VlastniProvoz.tsx"));

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

  // Průvodce příjezdem je pro hosty s odkazem — závoru webu obchází, aby k němu
  // hosté s kufrem na ulici nemuseli zadávat heslo webu.
  if (typeof window !== "undefined" && isGuidePath(window.location.pathname.toLowerCase())) {
    return (
      <Suspense fallback={<div className="px-5 py-16 text-sm text-neutral-400">Načítám…</div>}>
        <Guide />
      </Suspense>
    );
  }

  if (!unlocked) return <SiteLock onUnlock={() => setUnlocked(true)} />;

  // Při build-time prerenderu (entry-ssg) není window; cestu dodá globál.
  const rawPath =
    typeof window === "undefined"
      ? ((globalThis as { __ANTAM_SSG_PATH__?: string }).__ANTAM_SSG_PATH__ ?? "/")
      : window.location.pathname;
  const resolved = resolvePath(rawPath);
  // Aliasy (/cz, /cs, /vi, koncové lomítko, /index.html) přepíšeme na kanonickou cestu.
  if (resolved && typeof window !== "undefined" && window.location.pathname !== resolved.canonical) {
    window.history.replaceState(null, "", resolved.canonical + (resolved.hash ? `#${resolved.hash}` : window.location.hash));
  }
  const pageEl = !resolved
    ? <NotFound />
    : resolved.page === "sprava"
      ? <Sprava />
      : resolved.page === "vlastni-provoz"
        ? <VlastniProvoz />
        : <Index />;
  return (
    <LanguageProvider>
      <Suspense fallback={null}>{pageEl}</Suspense>
    </LanguageProvider>
  );
};

export default App;
