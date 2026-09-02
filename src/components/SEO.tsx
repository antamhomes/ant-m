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
      title: "Správa krátkodobých pronájmů a Airbnb v Praze | Antam Homes",
      desc: "Správa krátkodobého pronájmu v Praze: hosté, úklid, ceny i vyúčtování. Ke každému přijatému bytu písemné roční minimum. Odměna 30 % z čistého výnosu.",
    },
    vi: {
      title: "Quản lý cho thuê ngắn hạn & Airbnb tại Praha | Antam Homes",
      desc: "Quản lý cho thuê ngắn hạn (Airbnb, Booking) tại Praha: Antam lo khách, dọn dẹp, giá và bảng kê. Căn nào nhận cũng có mức tối thiểu ghi trong hợp đồng.",
    },
  },
};

/** FAQPage JSON-LD from the same translations as the on-page accordion. */
export const buildFaqJsonLd = (lang: "cs" | "vi") => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: (["faq18", "faq5", "faq9", "faq4", "faq6", "faq16", "faq1", "faq11", "faq12", "faq10", "faq14", "faq15", "faq3", "faq7", "faq13"] as const).map((k) => ({
    "@type": "Question",
    name: t(lang, `${k}_q`),
    acceptedAnswer: { "@type": "Answer", text: t(lang, `${k}_a`) },
  })),
});

/** LocalBusiness JSON-LD; canonical URL follows the language. */
export const buildBusinessJsonLd = (lang: "cs" | "vi") => {
  const meta = META.home;
  const canonical = SITE + (lang === "cs" ? meta.pathCs : meta.pathVi);
  const ogImage = `${SITE}/og-image.jpg`;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE}/#business`,
    name: "Antam Homes",
    legalName: "Donut Point, s.r.o.",
    taxID: "21904022",
    url: canonical,
    image: ogImage,
    logo: `${SITE}/favicon.png`,
    description: meta[lang].desc,
    email: t(lang, "footer_email"),
    telephone: t(lang, "footer_phone"),
    priceRange: "30 % z čistého výnosu",
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

  // Structured data: FAQ rich results + local business card. Kept in sync with
  // the on-page FAQ via translations so Google never sees a mismatch. The pure
  // builders are exported: the build-time prerender (vite.config → entry-ssg)
  // injects the same JSON-LD statically for crawlers that don't run JS.
  const faqJsonLd = buildFaqJsonLd(lang);
  const businessJsonLd = buildBusinessJsonLd(lang);

  // Static <head> in index.html / vn/index.html already carries the right
  // tags for crawlers; this keeps them in sync when the visitor switches
  // language client-side, and injects the structured data. No head library.
  useEffect(() => {
    document.documentElement.lang = lang === "cs" ? "cs" : "vi";
    document.title = current.title;
    const setMeta = (attr: "name" | "property", key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const setLink = (rel: string, href: string, hreflang?: string) => {
      const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
      let el = document.head.querySelector<HTMLLinkElement>(sel);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        if (hreflang) el.hreflang = hreflang;
        document.head.appendChild(el);
      }
      el.href = href;
    };
    const setJsonLd = (id: string, data: unknown) => {
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement("script");
        el.id = id;
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data);
    };
    setMeta("name", "description", current.desc);
    setLink("canonical", canonical);
    setLink("alternate", csUrl, "cs");
    setLink("alternate", viUrl, "vi");
    setLink("alternate", csUrl, "x-default");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Antam Homes");
    setMeta("property", "og:title", current.title);
    setMeta("property", "og:description", current.desc);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:locale", locale);
    setMeta("property", "og:locale:alternate", altLocale);
    setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", current.title);
    setMeta("name", "twitter:description", current.desc);
    setMeta("name", "twitter:image", ogImage);
    setJsonLd("ld-faq", faqJsonLd);
    setJsonLd("ld-business", businessJsonLd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return null;
};

export default SEO;