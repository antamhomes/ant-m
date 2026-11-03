import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import App from "./App";

/**
 * Build-time prerender (called from vite.config's antam-ssg plugin, Node only).
 *
 * Proč: stránka je SPA a boti bez JavaScriptu (GPTBot, PerplexityBot, ClaudeBot,
 * části Bingu) viděli prázdné <body>. Google si JS vyrenderuje, generativní
 * vyhledávače většinou ne, takže /vn nešlo citovat. Tohle vyrenderuje skutečnou
 * aplikaci do dist/index.html, dist/vn/index.html a od 2. 11. 2026 i do
 * podstránek /sprava a /vlastni-provoz v obou jazycích (lib/pages.ts).
 *
 * Klient dál dělá createRoot().render(), který obsah při mountu nahradí; výměnu
 * kryje brand splash, žádná hydratace se neřeší. `onAllReady` počká i na lazy
 * sekce z Index.tsx.
 */
export const renderPage = (path: string): Promise<string> =>
  new Promise((resolve, reject) => {
    (globalThis as { __ANTAM_SSG_PATH__?: string }).__ANTAM_SSG_PATH__ = path;
    const chunks: Buffer[] = [];
    const out = new PassThrough();
    out.on("data", (c) => chunks.push(Buffer.from(c)));
    // React 18 writeChunk bug: když se vícebajtový znak (í, ồ, …) nevejde na konec
    // 2 kB bufferu, zapíše se celý buffer včetně nevyplněných nul (opraveno až v
    // React 19). V HTML pak byly NUL byty uprostřed slov. Obsah NUL nikdy neobsahuje.
    out.on("end", () => resolve(Buffer.concat(chunks).toString("utf8").replace(/\0/g, "")));
    out.on("error", reject);
    const { pipe, abort } = renderToPipeableStream(<App />, {
      onAllReady() {
        pipe(out);
      },
      onError(err) {
        abort();
        reject(err);
      },
    });
  });

export { buildFaqJsonLd, buildBusinessJsonLd } from "./components/SEO";
export { SITE_LOCK_ENABLED } from "./lib/siteLock";
