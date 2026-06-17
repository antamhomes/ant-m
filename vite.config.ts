import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const VI_TITLE = "Quản lý cho thuê ngắn hạn & Airbnb tại Praha | antam homes";
const VI_DESC =
  "Dịch vụ quản lý căn hộ cho thuê ngắn hạn tại Praha — chuẩn bị listing, lo cho khách, dọn dẹp, định giá và báo cáo rõ ràng cho chủ nhà. Thu nhập tốt hơn, ít lo hơn.";
const SITE = "https://www.antamhomes.com";

function prerenderVnPlugin() {
  return {
    name: "prerender-vn",
    apply: "build" as const,
    enforce: "post" as const,
    generateBundle(_options: unknown, bundle: Record<string, { type: string; fileName: string; source?: string | Uint8Array }>) {
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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
