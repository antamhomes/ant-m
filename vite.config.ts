import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

const VI_TITLE = "Quản lý cho thuê ngắn hạn & Airbnb tại Praha | antam homes";
const VI_DESC =
  "Quản lý cho thuê ngắn hạn (Airbnb, Booking) tại Praha: lo khách, dọn dẹp, đặt giá, bảng kê hằng tháng cho chủ nhà. Căn nào nhận cũng có mức tối thiểu ghi trong hợp đồng.";
const SITE = "https://www.antamhomes.com";

import type { Plugin } from "vite";

function prerenderVnPlugin(): Plugin {
  return {
    name: "prerender-vn",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const indexAsset = bundle["index.html"];
      if (!indexAsset || indexAsset.type !== "asset") return;
      let html = typeof indexAsset.source === "string"
        ? indexAsset.source
        : new TextDecoder().decode(indexAsset.source as Uint8Array);

      // lang
      html = html.replace(/<html\s+lang="[^"]*"/i, '<html lang="vi"');
      // <title>
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${VI_TITLE}</title>`);
      // meta description
      html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${VI_DESC}" />`
      );
      // og:title / og:description / og:url / og:locale / og:locale:alternate
      html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${VI_TITLE}" />`
      );
      html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${VI_DESC}" />`
      );
      html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${SITE}/vn" />`
      );
      html = html.replace(
        /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:locale" content="vi_VN" />`
      );
      html = html.replace(
        /<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:locale:alternate" content="cs_CZ" />`
      );
      html = html.replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<link rel="canonical" href="${SITE}/vn" />`
      );
      // Vietnamese page: preload the vietnamese Playfair subset instead of latin-ext
      html = html.replace(
        /playfair-display-latin-ext-500-normal\.woff2/,
        "playfair-display-vietnamese-500-normal.woff2"
      );
      // twitter
      html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:title" content="${VI_TITLE}" />`
      );
      html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:description" content="${VI_DESC}" />`
      );

      this.emitFile({
        type: "asset",
        fileName: "vn/index.html",
        source: html,
      });
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
    prerenderVnPlugin(),
    mcpPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
