import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import App from "./App";

/**
 * Build-time prerender (called from vite.config's antam-ssg plugin, Node only).
 *
 * Proč: stránka je SPA a boti bez JavaScriptu (GPTBot, PerplexityBot, ClaudeBot,
 * části Bingu) viděli prázdné <body>. Google si JS vyrenderuje, generativní
 * vyhledávače většinou ne, takže /vn nešlo citovat. Tohle vyrenderuje skutečnou
 * aplikaci do dist/index.html a dist/vn/index.html.
 *
 * Klient dál dělá createRoot().render(), který obsah při mountu nahradí; výměnu
 * kryje brand splash, žádná hydratace se neřeší. `onAllReady` počká i na lazy
 * sekce z Index.tsx.
 */
export const renderPage = (path: "/" | "/vn"): Promise<string> =>
  new Promise((resolve, reject) => {
    (globalThis as { __ANTAM_SSG_PATH__?: string }).__ANTAM_SSG_PATH__ = path;
    const chunks: Buffer[] = [];
    const out = new PassThrough();
    out.on("data", (c) => chunks.push(Buffer.from(c)));
    out.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
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
