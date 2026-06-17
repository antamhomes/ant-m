import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const SITE = "https://www.antamhomes.com";

type PageKey = "home" | "portfolio";

const META: Record<PageKey, { cs: { title: string; desc: string }; vi: { title: string; desc: string }; pathCs: string; pathVi: string }> = {
  home: {
    pathCs: "/",
    pathVi: "/vn",
    cs: {
      title: "Správa krátkodobých pronájmů a Airbnb v Praze | antam homes",
      desc: "Kompletní správa krátkodobého pronájmu v Praze — příprava nabídky, hosté, úklid, dynamické ceny a přehledné reporty pro majitele. Více výnosu, méně starostí.",
    },
    vi: {
      title: "Quản lý cho thuê ngắn hạn & Airbnb tại Praha | antam homes",
      desc: "Dịch vụ quản lý căn hộ cho thuê ngắn hạn tại Praha — chuẩn bị listing, lo cho khách, dọn dẹp, định giá và báo cáo rõ ràng cho chủ nhà. Thu nhập tốt hơn, ít lo hơn.",
    },
  },
  portfolio: {
    pathCs: "/portfolio",
    pathVi: "/portfolio",
    cs: {
      title: "Portfolio realizací — byty a krátkodobé pronájmy v Praze | antam homes",
      desc: "Vybrané byty, o které pečujeme — interiéry, fotky a lokality. Inspirace pro majitele, kteří přemýšlí o krátkodobém pronájmu s antam homes.",
    },
    vi: {
      title: "Portfolio các căn hộ chúng tôi quản lý tại Praha | antam homes",
      desc: "Một số căn hộ chúng tôi đang chăm sóc — nội thất, hình ảnh và vị trí. Tham khảo cho chủ nhà đang cân nhắc cho thuê ngắn hạn cùng antam homes.",
    },
  },
};

export const SEO = ({ page }: { page: PageKey }) => {
  const { lang } = useLanguage();
  const meta = META[page];
  const current = meta[lang];
  const canonicalPath = lang === "cs" ? meta.pathCs : meta.pathVi;
  const canonical = SITE + canonicalPath;
  const csUrl = SITE + meta.pathCs;
  const viUrl = SITE + meta.pathVi;
  const locale = lang === "cs" ? "cs_CZ" : "vi_VN";
  const altLocale = lang === "cs" ? "vi_VN" : "cs_CZ";
  const ogImage = `${SITE}/og-image.jpg`;

  return (
    <Helmet>
      <html lang={lang === "cs" ? "cs" : "vi"} />
      <title>{current.title}</title>
      <meta name="description" content={current.desc} />
      <link rel="canonical" href={canonical} />

      <link rel="alternate" hrefLang="cs" href={csUrl} />
      <link rel="alternate" hrefLang="vi" href={viUrl} />
      <link rel="alternate" hrefLang="x-default" href={csUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="antam homes" />
      <meta property="og:title" content={current.title} />
      <meta property="og:description" content={current.desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={altLocale} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={current.title} />
      <meta name="twitter:description" content={current.desc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;