import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { useEffect } from "react";

const SITE = "https://www.antamhomes.com";

type PageKey = "home";

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
};

export const SEO = ({ page }: { page: PageKey }) => {
  const { lang } = useLanguage();

  // react-helmet-async appends its tags but does not remove pre-existing
  // static ones from index.html, which leaves duplicates (the static Czech
  // tags appear first and win for crawlers/queries). Strip any meta tags in
  // the static head that Helmet now manages so Helmet's values are the only
  // ones present.
  useEffect(() => {
    const selectors = [
      'meta[name="description"]',
      'meta[name="twitter:card"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="twitter:image"]',
      'meta[property="og:type"]',
      'meta[property="og:site_name"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:url"]',
      'meta[property="og:locale"]',
      'meta[property="og:locale:alternate"]',
      'meta[property="og:image"]',
    ];
    selectors.forEach((sel) => {
      document.head
        .querySelectorAll(sel)
        .forEach((el) => {
          if (!el.hasAttribute("data-rh")) el.remove();
        });
    });
  }, [lang]);

  const meta = META[page];
  const current = meta[lang];
  const canonicalPath = lang === "cs" ? meta.pathCs : meta.pathVi;
  const canonical = SITE + canonicalPath;
  const csUrl = SITE + meta.pathCs;
  const viUrl = SITE + meta.pathVi;
  const locale = lang === "cs" ? "cs_CZ" : "vi_VN";
  const altLocale = lang === "cs" ? "vi_VN" : "cs_CZ";
  const ogImage = `${SITE}/og-image.jpg`;

  // Structured data: FAQ rich results + local business card. Kept in sync with
  // the on-page FAQ via translations so Google never sees a mismatch.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (["faq1", "faq2", "faq3", "faq4", "faq5", "faq6", "faq7", "faq8"] as const).map((k) => ({
      "@type": "Question",
      name: t(lang, `${k}_q`),
      acceptedAnswer: { "@type": "Answer", text: t(lang, `${k}_a`) },
    })),
  };
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE}/#business`,
    name: "antam homes",
    legalName: "Donut Point, s.r.o.",
    taxID: "21904022",
    url: canonical,
    image: ogImage,
    logo: `${SITE}/favicon.png`,
    description: current.desc,
    email: t(lang, "footer_email"),
    telephone: t(lang, "footer_phone"),
    priceRange: "25 % z výnosu",
    areaServed: { "@type": "City", name: "Praha" },
    address: { "@type": "PostalAddress", streetAddress: "Příčná 1892/4", addressLocality: "Praha 1", postalCode: "110 00", addressCountry: "CZ" },
    knowsLanguage: ["cs", "vi"],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: lang === "cs" ? "Správa krátkodobých pronájmů (Airbnb, Booking.com)" : "Quản lý cho thuê ngắn hạn (Airbnb, Booking.com)",
        areaServed: "Praha",
      },
    },
  };

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

      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(businessJsonLd)}</script>
    </Helmet>
  );
};

export default SEO;