import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

const SITE = "https://www.antamhomes.com";

import type { Plugin } from "vite";
import { META } from "./src/lib/seoMeta";

/**
 * Po dokončení buildu vyrenderuje aplikaci (entry-ssg.tsx) do statického HTML
 * obou jazyků a vloží ho do <div id="root"> + JSON-LD do <head>. Boti bez JS
 * (GPTBot, PerplexityBot, ClaudeBot) tak čtou plný obsah; pro návštěvníka se
 * nic nemění, React obsah při mountu nahradí pod brand splashem.
 */
function ssgPrerenderPlugin(): Plugin {
  return {
    name: "antam-ssg",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      const [{ createServer }, fs] = await Promise.all([
        import("vite"),
        import("node:fs/promises"),
      ]);
      // Bez react-swc pluginu: TSX přeloží esbuild Vite samotného a v prod
      // NODE_ENV sáhne po produkčním jsx-runtime (swc v serve módu tahal jsxDEV).
      const server = await createServer({
        configFile: false,
        mode: "production",
        logLevel: "error",
        resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
        server: { middlewareMode: true },
        appType: "custom",
      });
      try {
        const mod = await server.ssrLoadModule("/src/entry-ssg.tsx");
        const safe = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
        // Šest stránek (lib/pages.ts): homepage a dvě podstránky, každá v obou jazycích.
        const targets: Array<[string, string, "cs" | "vi", "home" | "sprava" | "vlastni-provoz"]> = [
          ["dist/index.html", "/", "cs", "home"],
          ["dist/vn/index.html", "/vn", "vi", "home"],
          ["dist/sprava/index.html", "/sprava", "cs", "sprava"],
          ["dist/vn/sprava/index.html", "/vn/sprava", "vi", "sprava"],
          ["dist/vlastni-provoz/index.html", "/vlastni-provoz", "cs", "vlastni-provoz"],
          ["dist/vn/vlastni-provoz/index.html", "/vn/vlastni-provoz", "vi", "vlastni-provoz"],
        ];
        for (const [file, route, lang, page] of targets) {
          const html = await fs.readFile(file, "utf8");
          const app: string = await mod.renderPage(route);
          // Zamčený web: žádný JSON-LD (obsahuje FAQ) a noindex, dokud se závora nevypne.
          const head: string = mod.SITE_LOCK_ENABLED
            ? `<meta name="robots" content="noindex, nofollow">`
            : `<script id="ld-faq" type="application/ld+json">${safe(mod.buildFaqJsonLd(lang, page))}</script>` +
              `<script id="ld-business" type="application/ld+json">${safe(mod.buildBusinessJsonLd(lang, page))}</script>`;
          const out = html
            .replace('<div id="root"></div>', `<div id="root">${app}</div>`)
            .replace("</head>", `${head}</head>`);
          if (out === html) throw new Error(`antam-ssg: injection anchors not found in ${file}`);
          await fs.writeFile(file, out);
          console.log(`antam-ssg: prerendered ${file} (${Math.round(app.length / 1024)} kB of content${mod.SITE_LOCK_ENABLED ? ", LOCKED" : ""})`);
        }
      } finally {
        await server.close();
      }
    },
  };
}


/**
 * Z dist/index.html vyrobí statické HTML ostatních pěti stránek s vlastním
 * <head> (title, description, canonical, hreflang, og, twitter, lang, font
 * subset). Obsah do <div id="root"> dodá až antam-ssg plugin po buildu.
 * Meta texty jsou jedna pravda v src/components/SEO.tsx (META).
 */
function prerenderPagesPlugin(): Plugin {
  return {
    name: "prerender-pages",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const indexAsset = bundle["index.html"];
      if (!indexAsset || indexAsset.type !== "asset") return;
      const base = typeof indexAsset.source === "string"
        ? indexAsset.source
        : new TextDecoder().decode(indexAsset.source as Uint8Array);
      const PATHS: Record<string, { cs: string; vi: string }> = {
        home: { cs: "/", vi: "/vn" },
        sprava: { cs: "/sprava", vi: "/vn/sprava" },
        "vlastni-provoz": { cs: "/vlastni-provoz", vi: "/vn/vlastni-provoz" },
      };
      const esc = (x: string) => x.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const pages: Array<[string, "cs" | "vi", string]> = [
        ["home", "vi", "vn/index.html"],
        ["sprava", "cs", "sprava/index.html"],
        ["sprava", "vi", "vn/sprava/index.html"],
        ["vlastni-provoz", "cs", "vlastni-provoz/index.html"],
        ["vlastni-provoz", "vi", "vn/vlastni-provoz/index.html"],
      ];
      for (const [page, lang, fileName] of pages) {
        const m = META[page as keyof typeof META][lang];
        const title = esc(m.title); const desc = esc(m.desc);
        const self = SITE + PATHS[page][lang];
        const cs = SITE + PATHS[page].cs; const vi = SITE + PATHS[page].vi;
        let html = base;
        html = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
        html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${desc}" />`);
        html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
        html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${desc}" />`);
        html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${self}" />`);
        html = html.replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:locale" content="${lang === "vi" ? "vi_VN" : "cs_CZ"}" />`);
        html = html.replace(/<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:locale:alternate" content="${lang === "vi" ? "cs_CZ" : "vi_VN"}" />`);
        html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${self}" />`);
        html = html.replace(/<link rel="alternate" hreflang="cs" href="[^"]*" \/>/, `<link rel="alternate" hreflang="cs" href="${cs}" />`);
        html = html.replace(/<link rel="alternate" hreflang="vi" href="[^"]*" \/>/, `<link rel="alternate" hreflang="vi" href="${vi}" />`);
        html = html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/, `<link rel="alternate" hreflang="x-default" href="${cs}" />`);
        html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
        html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${desc}" />`);
        if (lang === "vi") html = html.replace(/playfair-display-latin-ext-500-normal\.woff2/, "playfair-display-vietnamese-500-normal.woff2");
        this.emitFile({ type: "asset", fileName, source: html });
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    // Older phones (iOS 13/14, Android WebView) still get plain ES2019 syntax.
    target: ["es2019", "safari13", "chrome80", "firefox78"],
    cssTarget: ["safari13", "chrome80", "firefox78"],
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    prerenderPagesPlugin(),
    ssgPrerenderPlugin(),
    mcpPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
