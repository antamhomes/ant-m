// vite.config.ts
import { defineConfig } from "file:///sessions/rcw-01avgbsvcrpvkdvydyyjaurt/mnt/ant-m/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/rcw-01avgbsvcrpvkdvydyyjaurt/mnt/ant-m/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///sessions/rcw-01avgbsvcrpvkdvydyyjaurt/mnt/ant-m/node_modules/lovable-tagger/dist/index.js";
import { mcpPlugin } from "file:///sessions/rcw-01avgbsvcrpvkdvydyyjaurt/mnt/ant-m/node_modules/@lovable.dev/mcp-js/dist/stacks/supabase/vite.js";
var __vite_injected_original_dirname = "/sessions/rcw-01avgbsvcrpvkdvydyyjaurt/mnt/ant-m";
var VI_TITLE = "Qu\u1EA3n l\xFD cho thu\xEA ng\u1EAFn h\u1EA1n & Airbnb t\u1EA1i Praha | antam homes";
var VI_DESC = "Qu\u1EA3n l\xFD cho thu\xEA ng\u1EAFn h\u1EA1n (Airbnb, Booking) t\u1EA1i Praha: Antam lo kh\xE1ch, d\u1ECDn d\u1EB9p, gi\xE1 v\xE0 b\u1EA3ng k\xEA. C\u0103n n\xE0o nh\u1EADn c\u0169ng c\xF3 m\u1EE9c t\u1ED1i thi\u1EC3u ghi trong h\u1EE3p \u0111\u1ED3ng.";
var SITE = "https://www.antamhomes.com";
function ssgPrerenderPlugin() {
  return {
    name: "antam-ssg",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      const [{ createServer }, fs] = await Promise.all([
        import("file:///sessions/rcw-01avgbsvcrpvkdvydyyjaurt/mnt/ant-m/node_modules/vite/dist/node/index.js"),
        import("node:fs/promises")
      ]);
      const server = await createServer({
        configFile: false,
        mode: "production",
        logLevel: "error",
        resolve: { alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") } },
        server: { middlewareMode: true },
        appType: "custom"
      });
      try {
        const mod = await server.ssrLoadModule("/src/entry-ssg.tsx");
        const safe = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
        const targets = [
          ["dist/index.html", "/", "cs"],
          ["dist/vn/index.html", "/vn", "vi"]
        ];
        for (const [file, route, lang] of targets) {
          const html = await fs.readFile(file, "utf8");
          const app = await mod.renderPage(route);
          const ld = `<script id="ld-faq" type="application/ld+json">${safe(mod.buildFaqJsonLd(lang))}</script><script id="ld-business" type="application/ld+json">${safe(mod.buildBusinessJsonLd(lang))}</script>`;
          const out = html.replace('<div id="root"></div>', `<div id="root">${app}</div>`).replace("</head>", `${ld}</head>`);
          if (out === html) throw new Error(`antam-ssg: injection anchors not found in ${file}`);
          await fs.writeFile(file, out);
          console.log(`antam-ssg: prerendered ${file} (${Math.round(app.length / 1024)} kB of content)`);
        }
      } finally {
        await server.close();
      }
    }
  };
}
function prerenderVnPlugin() {
  return {
    name: "prerender-vn",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const indexAsset = bundle["index.html"];
      if (!indexAsset || indexAsset.type !== "asset") return;
      let html = typeof indexAsset.source === "string" ? indexAsset.source : new TextDecoder().decode(indexAsset.source);
      html = html.replace(/<html\s+lang="[^"]*"/i, '<html lang="vi"');
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${VI_TITLE}</title>`);
      html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${VI_DESC}" />`
      );
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
      html = html.replace(
        /playfair-display-latin-ext-500-normal\.woff2/,
        "playfair-display-vietnamese-500-normal.woff2"
      );
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
        source: html
      });
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => ({
  build: {
    // Older phones (iOS 13/14, Android WebView) still get plain ES2019 syntax.
    target: ["es2019", "safari13", "chrome80", "firefox78"],
    cssTarget: ["safari13", "chrome80", "firefox78"],
    chunkSizeWarningLimit: 600
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    prerenderVnPlugin(),
    ssgPrerenderPlugin(),
    mcpPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvcmN3LTAxYXZnYnN2Y3JwdmtkdnlkeXlqYXVydC9tbnQvYW50LW1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9yY3ctMDFhdmdic3ZjcnB2a2R2eWR5eWphdXJ0L21udC9hbnQtbS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvcmN3LTAxYXZnYnN2Y3JwdmtkdnlkeXlqYXVydC9tbnQvYW50LW0vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IG1jcFBsdWdpbiB9IGZyb20gXCJAbG92YWJsZS5kZXYvbWNwLWpzL3N0YWNrcy9zdXBhYmFzZS92aXRlXCI7XG5cbmNvbnN0IFZJX1RJVExFID0gXCJRdVx1MUVBM24gbFx1MDBGRCBjaG8gdGh1XHUwMEVBIG5nXHUxRUFGbiBoXHUxRUExbiAmIEFpcmJuYiB0XHUxRUExaSBQcmFoYSB8IGFudGFtIGhvbWVzXCI7XG5jb25zdCBWSV9ERVNDID1cbiAgXCJRdVx1MUVBM24gbFx1MDBGRCBjaG8gdGh1XHUwMEVBIG5nXHUxRUFGbiBoXHUxRUExbiAoQWlyYm5iLCBCb29raW5nKSB0XHUxRUExaSBQcmFoYTogQW50YW0gbG8ga2hcdTAwRTFjaCwgZFx1MUVDRG4gZFx1MUVCOXAsIGdpXHUwMEUxIHZcdTAwRTAgYlx1MUVBM25nIGtcdTAwRUEuIENcdTAxMDNuIG5cdTAwRTBvIG5oXHUxRUFEbiBjXHUwMTY5bmcgY1x1MDBGMyBtXHUxRUU5YyB0XHUxRUQxaSB0aGlcdTFFQzN1IGdoaSB0cm9uZyBoXHUxRUUzcCBcdTAxMTFcdTFFRDNuZy5cIjtcbmNvbnN0IFNJVEUgPSBcImh0dHBzOi8vd3d3LmFudGFtaG9tZXMuY29tXCI7XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcblxuLyoqXG4gKiBQbyBkb2tvblx1MDEwRGVuXHUwMEVEIGJ1aWxkdSB2eXJlbmRlcnVqZSBhcGxpa2FjaSAoZW50cnktc3NnLnRzeCkgZG8gc3RhdGlja1x1MDBFOWhvIEhUTUxcbiAqIG9ib3UgamF6eWtcdTAxNkYgYSB2bG9cdTAxN0VcdTAwRUQgaG8gZG8gPGRpdiBpZD1cInJvb3RcIj4gKyBKU09OLUxEIGRvIDxoZWFkPi4gQm90aSBiZXogSlNcbiAqIChHUFRCb3QsIFBlcnBsZXhpdHlCb3QsIENsYXVkZUJvdCkgdGFrIFx1MDEwRHRvdSBwbG5cdTAwRkQgb2JzYWg7IHBybyBuXHUwMEUxdlx1MDE2MXRcdTAxMUJ2blx1MDBFRGthIHNlXG4gKiBuaWMgbmVtXHUwMTFCblx1MDBFRCwgUmVhY3Qgb2JzYWggcFx1MDE1OWkgbW91bnR1IG5haHJhZFx1MDBFRCBwb2QgYnJhbmQgc3BsYXNoZW0uXG4gKi9cbmZ1bmN0aW9uIHNzZ1ByZXJlbmRlclBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwiYW50YW0tc3NnXCIsXG4gICAgYXBwbHk6IFwiYnVpbGRcIixcbiAgICBlbmZvcmNlOiBcInBvc3RcIixcbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGNvbnN0IFt7IGNyZWF0ZVNlcnZlciB9LCBmc10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGltcG9ydChcInZpdGVcIiksXG4gICAgICAgIGltcG9ydChcIm5vZGU6ZnMvcHJvbWlzZXNcIiksXG4gICAgICBdKTtcbiAgICAgIC8vIEJleiByZWFjdC1zd2MgcGx1Z2ludTogVFNYIHBcdTAxNTllbG9cdTAxN0VcdTAwRUQgZXNidWlsZCBWaXRlIHNhbW90blx1MDBFOWhvIGEgdiBwcm9kXG4gICAgICAvLyBOT0RFX0VOViBzXHUwMEUxaG5lIHBvIHByb2R1a1x1MDEwRG5cdTAwRURtIGpzeC1ydW50aW1lIChzd2MgdiBzZXJ2ZSBtXHUwMEYzZHUgdGFoYWwganN4REVWKS5cbiAgICAgIGNvbnN0IHNlcnZlciA9IGF3YWl0IGNyZWF0ZVNlcnZlcih7XG4gICAgICAgIGNvbmZpZ0ZpbGU6IGZhbHNlLFxuICAgICAgICBtb2RlOiBcInByb2R1Y3Rpb25cIixcbiAgICAgICAgbG9nTGV2ZWw6IFwiZXJyb3JcIixcbiAgICAgICAgcmVzb2x2ZTogeyBhbGlhczogeyBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSB9IH0sXG4gICAgICAgIHNlcnZlcjogeyBtaWRkbGV3YXJlTW9kZTogdHJ1ZSB9LFxuICAgICAgICBhcHBUeXBlOiBcImN1c3RvbVwiLFxuICAgICAgfSk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBtb2QgPSBhd2FpdCBzZXJ2ZXIuc3NyTG9hZE1vZHVsZShcIi9zcmMvZW50cnktc3NnLnRzeFwiKTtcbiAgICAgICAgY29uc3Qgc2FmZSA9IChkYXRhOiB1bmtub3duKSA9PiBKU09OLnN0cmluZ2lmeShkYXRhKS5yZXBsYWNlKC88L2csIFwiXFxcXHUwMDNjXCIpO1xuICAgICAgICBjb25zdCB0YXJnZXRzOiBBcnJheTxbXCJkaXN0L2luZGV4Lmh0bWxcIiB8IFwiZGlzdC92bi9pbmRleC5odG1sXCIsIFwiL1wiIHwgXCIvdm5cIiwgXCJjc1wiIHwgXCJ2aVwiXT4gPSBbXG4gICAgICAgICAgW1wiZGlzdC9pbmRleC5odG1sXCIsIFwiL1wiLCBcImNzXCJdLFxuICAgICAgICAgIFtcImRpc3Qvdm4vaW5kZXguaHRtbFwiLCBcIi92blwiLCBcInZpXCJdLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IFtmaWxlLCByb3V0ZSwgbGFuZ10gb2YgdGFyZ2V0cykge1xuICAgICAgICAgIGNvbnN0IGh0bWwgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlLCBcInV0ZjhcIik7XG4gICAgICAgICAgY29uc3QgYXBwOiBzdHJpbmcgPSBhd2FpdCBtb2QucmVuZGVyUGFnZShyb3V0ZSk7XG4gICAgICAgICAgY29uc3QgbGQgPVxuICAgICAgICAgICAgYDxzY3JpcHQgaWQ9XCJsZC1mYXFcIiB0eXBlPVwiYXBwbGljYXRpb24vbGQranNvblwiPiR7c2FmZShtb2QuYnVpbGRGYXFKc29uTGQobGFuZykpfTwvc2NyaXB0PmAgK1xuICAgICAgICAgICAgYDxzY3JpcHQgaWQ9XCJsZC1idXNpbmVzc1wiIHR5cGU9XCJhcHBsaWNhdGlvbi9sZCtqc29uXCI+JHtzYWZlKG1vZC5idWlsZEJ1c2luZXNzSnNvbkxkKGxhbmcpKX08L3NjcmlwdD5gO1xuICAgICAgICAgIGNvbnN0IG91dCA9IGh0bWxcbiAgICAgICAgICAgIC5yZXBsYWNlKCc8ZGl2IGlkPVwicm9vdFwiPjwvZGl2PicsIGA8ZGl2IGlkPVwicm9vdFwiPiR7YXBwfTwvZGl2PmApXG4gICAgICAgICAgICAucmVwbGFjZShcIjwvaGVhZD5cIiwgYCR7bGR9PC9oZWFkPmApO1xuICAgICAgICAgIGlmIChvdXQgPT09IGh0bWwpIHRocm93IG5ldyBFcnJvcihgYW50YW0tc3NnOiBpbmplY3Rpb24gYW5jaG9ycyBub3QgZm91bmQgaW4gJHtmaWxlfWApO1xuICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShmaWxlLCBvdXQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBhbnRhbS1zc2c6IHByZXJlbmRlcmVkICR7ZmlsZX0gKCR7TWF0aC5yb3VuZChhcHAubGVuZ3RoIC8gMTAyNCl9IGtCIG9mIGNvbnRlbnQpYCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF3YWl0IHNlcnZlci5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcHJlcmVuZGVyVm5QbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInByZXJlbmRlci12blwiLFxuICAgIGFwcGx5OiBcImJ1aWxkXCIsXG4gICAgZW5mb3JjZTogXCJwb3N0XCIsXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgY29uc3QgaW5kZXhBc3NldCA9IGJ1bmRsZVtcImluZGV4Lmh0bWxcIl07XG4gICAgICBpZiAoIWluZGV4QXNzZXQgfHwgaW5kZXhBc3NldC50eXBlICE9PSBcImFzc2V0XCIpIHJldHVybjtcbiAgICAgIGxldCBodG1sID0gdHlwZW9mIGluZGV4QXNzZXQuc291cmNlID09PSBcInN0cmluZ1wiXG4gICAgICAgID8gaW5kZXhBc3NldC5zb3VyY2VcbiAgICAgICAgOiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoaW5kZXhBc3NldC5zb3VyY2UgYXMgVWludDhBcnJheSk7XG5cbiAgICAgIC8vIGxhbmdcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLzxodG1sXFxzK2xhbmc9XCJbXlwiXSpcIi9pLCAnPGh0bWwgbGFuZz1cInZpXCInKTtcbiAgICAgIC8vIDx0aXRsZT5cbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLzx0aXRsZT5bXFxzXFxTXSo/PFxcL3RpdGxlPi9pLCBgPHRpdGxlPiR7VklfVElUTEV9PC90aXRsZT5gKTtcbiAgICAgIC8vIG1ldGEgZGVzY3JpcHRpb25cbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgIC88bWV0YVxccytuYW1lPVwiZGVzY3JpcHRpb25cIlxccytjb250ZW50PVwiW15cIl0qXCJcXHMqXFwvPz4vaSxcbiAgICAgICAgYDxtZXRhIG5hbWU9XCJkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCIke1ZJX0RFU0N9XCIgLz5gXG4gICAgICApO1xuICAgICAgLy8gb2c6dGl0bGUgLyBvZzpkZXNjcmlwdGlvbiAvIG9nOnVybCAvIG9nOmxvY2FsZSAvIG9nOmxvY2FsZTphbHRlcm5hdGVcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgIC88bWV0YVxccytwcm9wZXJ0eT1cIm9nOnRpdGxlXCJcXHMrY29udGVudD1cIlteXCJdKlwiXFxzKlxcLz8+L2ksXG4gICAgICAgIGA8bWV0YSBwcm9wZXJ0eT1cIm9nOnRpdGxlXCIgY29udGVudD1cIiR7VklfVElUTEV9XCIgLz5gXG4gICAgICApO1xuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShcbiAgICAgICAgLzxtZXRhXFxzK3Byb3BlcnR5PVwib2c6ZGVzY3JpcHRpb25cIlxccytjb250ZW50PVwiW15cIl0qXCJcXHMqXFwvPz4vaSxcbiAgICAgICAgYDxtZXRhIHByb3BlcnR5PVwib2c6ZGVzY3JpcHRpb25cIiBjb250ZW50PVwiJHtWSV9ERVNDfVwiIC8+YFxuICAgICAgKTtcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgIC88bWV0YVxccytwcm9wZXJ0eT1cIm9nOnVybFwiXFxzK2NvbnRlbnQ9XCJbXlwiXSpcIlxccypcXC8/Pi9pLFxuICAgICAgICBgPG1ldGEgcHJvcGVydHk9XCJvZzp1cmxcIiBjb250ZW50PVwiJHtTSVRFfS92blwiIC8+YFxuICAgICAgKTtcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgIC88bWV0YVxccytwcm9wZXJ0eT1cIm9nOmxvY2FsZVwiXFxzK2NvbnRlbnQ9XCJbXlwiXSpcIlxccypcXC8/Pi9pLFxuICAgICAgICBgPG1ldGEgcHJvcGVydHk9XCJvZzpsb2NhbGVcIiBjb250ZW50PVwidmlfVk5cIiAvPmBcbiAgICAgICk7XG4gICAgICBodG1sID0gaHRtbC5yZXBsYWNlKFxuICAgICAgICAvPG1ldGFcXHMrcHJvcGVydHk9XCJvZzpsb2NhbGU6YWx0ZXJuYXRlXCJcXHMrY29udGVudD1cIlteXCJdKlwiXFxzKlxcLz8+L2ksXG4gICAgICAgIGA8bWV0YSBwcm9wZXJ0eT1cIm9nOmxvY2FsZTphbHRlcm5hdGVcIiBjb250ZW50PVwiY3NfQ1pcIiAvPmBcbiAgICAgICk7XG4gICAgICBodG1sID0gaHRtbC5yZXBsYWNlKFxuICAgICAgICAvPGxpbmsgcmVsPVwiY2Fub25pY2FsXCIgaHJlZj1cIlteXCJdKlwiIFxcLz4vLFxuICAgICAgICBgPGxpbmsgcmVsPVwiY2Fub25pY2FsXCIgaHJlZj1cIiR7U0lURX0vdm5cIiAvPmBcbiAgICAgICk7XG4gICAgICAvLyBWaWV0bmFtZXNlIHBhZ2U6IHByZWxvYWQgdGhlIHZpZXRuYW1lc2UgUGxheWZhaXIgc3Vic2V0IGluc3RlYWQgb2YgbGF0aW4tZXh0XG4gICAgICBodG1sID0gaHRtbC5yZXBsYWNlKFxuICAgICAgICAvcGxheWZhaXItZGlzcGxheS1sYXRpbi1leHQtNTAwLW5vcm1hbFxcLndvZmYyLyxcbiAgICAgICAgXCJwbGF5ZmFpci1kaXNwbGF5LXZpZXRuYW1lc2UtNTAwLW5vcm1hbC53b2ZmMlwiXG4gICAgICApO1xuICAgICAgLy8gdHdpdHRlclxuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShcbiAgICAgICAgLzxtZXRhXFxzK25hbWU9XCJ0d2l0dGVyOnRpdGxlXCJcXHMrY29udGVudD1cIlteXCJdKlwiXFxzKlxcLz8+L2ksXG4gICAgICAgIGA8bWV0YSBuYW1lPVwidHdpdHRlcjp0aXRsZVwiIGNvbnRlbnQ9XCIke1ZJX1RJVExFfVwiIC8+YFxuICAgICAgKTtcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgIC88bWV0YVxccytuYW1lPVwidHdpdHRlcjpkZXNjcmlwdGlvblwiXFxzK2NvbnRlbnQ9XCJbXlwiXSpcIlxccypcXC8/Pi9pLFxuICAgICAgICBgPG1ldGEgbmFtZT1cInR3aXR0ZXI6ZGVzY3JpcHRpb25cIiBjb250ZW50PVwiJHtWSV9ERVNDfVwiIC8+YFxuICAgICAgKTtcblxuICAgICAgdGhpcy5lbWl0RmlsZSh7XG4gICAgICAgIHR5cGU6IFwiYXNzZXRcIixcbiAgICAgICAgZmlsZU5hbWU6IFwidm4vaW5kZXguaHRtbFwiLFxuICAgICAgICBzb3VyY2U6IGh0bWwsXG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgYnVpbGQ6IHtcbiAgICAvLyBPbGRlciBwaG9uZXMgKGlPUyAxMy8xNCwgQW5kcm9pZCBXZWJWaWV3KSBzdGlsbCBnZXQgcGxhaW4gRVMyMDE5IHN5bnRheC5cbiAgICB0YXJnZXQ6IFtcImVzMjAxOVwiLCBcInNhZmFyaTEzXCIsIFwiY2hyb21lODBcIiwgXCJmaXJlZm94NzhcIl0sXG4gICAgY3NzVGFyZ2V0OiBbXCJzYWZhcmkxM1wiLCBcImNocm9tZTgwXCIsIFwiZmlyZWZveDc4XCJdLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNjAwLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBobXI6IHtcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgICBwcmVyZW5kZXJWblBsdWdpbigpLFxuICAgIHNzZ1ByZXJlbmRlclBsdWdpbigpLFxuICAgIG1jcFBsdWdpbigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICAgIGRlZHVwZTogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJyZWFjdC9qc3gtcnVudGltZVwiLCBcInJlYWN0L2pzeC1kZXYtcnVudGltZVwiLCBcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiLCBcIkB0YW5zdGFjay9xdWVyeS1jb3JlXCJdLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVSxTQUFTLG9CQUFvQjtBQUMvVixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsaUJBQWlCO0FBSjFCLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sV0FBVztBQUNqQixJQUFNLFVBQ0o7QUFDRixJQUFNLE9BQU87QUFVYixTQUFTLHFCQUE2QjtBQUNwQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxNQUFNLGNBQWM7QUFDbEIsWUFBTSxDQUFDLEVBQUUsYUFBYSxHQUFHLEVBQUUsSUFBSSxNQUFNLFFBQVEsSUFBSTtBQUFBLFFBQy9DLE9BQU8sOEZBQU07QUFBQSxRQUNiLE9BQU8sa0JBQWtCO0FBQUEsTUFDM0IsQ0FBQztBQUdELFlBQU0sU0FBUyxNQUFNLGFBQWE7QUFBQSxRQUNoQyxZQUFZO0FBQUEsUUFDWixNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsUUFDVixTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU8sRUFBRSxFQUFFO0FBQUEsUUFDNUQsUUFBUSxFQUFFLGdCQUFnQixLQUFLO0FBQUEsUUFDL0IsU0FBUztBQUFBLE1BQ1gsQ0FBQztBQUNELFVBQUk7QUFDRixjQUFNLE1BQU0sTUFBTSxPQUFPLGNBQWMsb0JBQW9CO0FBQzNELGNBQU0sT0FBTyxDQUFDLFNBQWtCLEtBQUssVUFBVSxJQUFJLEVBQUUsUUFBUSxNQUFNLFNBQVM7QUFDNUUsY0FBTSxVQUF1RjtBQUFBLFVBQzNGLENBQUMsbUJBQW1CLEtBQUssSUFBSTtBQUFBLFVBQzdCLENBQUMsc0JBQXNCLE9BQU8sSUFBSTtBQUFBLFFBQ3BDO0FBQ0EsbUJBQVcsQ0FBQyxNQUFNLE9BQU8sSUFBSSxLQUFLLFNBQVM7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
