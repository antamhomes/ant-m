import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { useEffect } from "react";

const SITE = "https://www.antamhomes.com";

import { pathFor, type PageKey } from "@/lib/pages";

export type { PageKey };

import { META } from "@/lib/seoMeta";

/** Otázky z FAQ dané stránky; homepage FAQ nemá, nese ji podstránka správy. */
export const FAQ_KEYS: Record<PageKey, readonly string[]> = {
  home: ["faq18", "faq5", "faq9", "faq16", "faq19", "faq13"],
  sprava: ["faq18", "faq5", "faq9", "faq4", "faq6", "faq16", "faq1", "faq11", "faq12", "faq10", "faq15", "faq3", "faq7", "faq13"],
  "vlastni-provoz": ["faq20", "faq21", "faq22", "faq19", "faq10", "faq12", "faq14"],
  kalkulacka: ["faq9", "faq18", "faq5", "faq13"],
};

/** FAQPage JSON-LD from the same translations as the on-page accordion. */
export const buildFaqJsonLd = (lang: "cs" | "vi", page: PageKey = "home") => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_KEYS[page].map((k) => ({
    "@type": "Question",
    name: t(lang, `${k}_q` as Parameters<typeof t>[1]),
    acceptedAnswer: { "@type": "Answer", text: t(lang, `${k}_a` as Parameters<typeof t>[1]) },
  })),
});

const BUSINESS_ID = `${SITE}/#business`;
const WEBSITE_ID = `${SITE}/#website`;
/** t() lepí nezlomitelné mezery kvůli sazbě; do strojových dat patří obyčejné. */
const plain = (s: string) => s.replace(/\u00a0/g, " ");
/** Název stránky bez značky na konci: jedna pravda zůstává v lib/seoMeta.ts. */
const pageName = (page: PageKey, lang: "cs" | "vi") => META[page][lang].title.replace(/\s*\|\s*Antam Homes$/i, "");

/**
 * Firma, web, stránka, obě služby a drobečková navigace v jednom @graph.
 * Vyhledávače i AI asistenti (ChatGPT, Perplexity, Gemini) z toho čtou, kdo
 * jsme, kde působíme a co přesně nabízíme. Texty jdou z META a z translations,
 * žádná kopie faktů navíc. Kanonická URL se řídí jazykem.
 */
export const buildBusinessJsonLd = (lang: "cs" | "vi", page: PageKey = "home") => {
  const meta = META[page];
  const canonical = SITE + pathFor(page, lang);
  const home = SITE + pathFor("home", lang);
  const inLanguage = lang === "cs" ? "cs-CZ" : "vi-VN";
  // 3. 11. 2026: náhled pro sdílení podle jazyka (CZ a VI text v obrázku).
  const ogImage = `${SITE}/${lang === "vi" ? "og-image-vn.jpg" : "og-image.jpg"}?v=3`;
  const praha = { "@type": "City", name: "Praha" };
  const service = (key: "sprava" | "vlastni-provoz") => ({
    "@type": "Offer",
    url: SITE + pathFor(key, lang),
    itemOffered: {
      "@type": "Service",
      "@id": `${SITE}${pathFor(key, lang)}#service`,
      name: pageName(key, lang),
      description: META[key][lang].desc,
      url: SITE + pathFor(key, lang),
      provider: { "@id": BUSINESS_ID },
      areaServed: praha,
    },
  });
  const phones = [plain(t(lang, "footer_phone")), plain(t(lang, "footer_office_phone"))];
  const business = {
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: "Antam Homes",
    legalName: "Donut Point, s.r.o.",
    taxID: "21904022",
    url: home,
    image: ogImage,
    logo: `${SITE}/apple-touch-icon.png`,
    description: META.home[lang].desc,
    email: plain(t(lang, "footer_email")),
    telephone: phones[0],
    contactPoint: phones.map((telephone) => ({
      "@type": "ContactPoint",
      telephone,
      contactType: "customer service",
      areaServed: "CZ",
      availableLanguage: ["Czech", "Vietnamese"],
    })),
    priceRange: "20 % + DPH z příjmu po poplatcích, nebo systém jednorázově od 180 000 Kč",
    areaServed: praha,
    address: { "@type": "PostalAddress", streetAddress: "Příčná 1892/4", addressLocality: "Praha 1", postalCode: "110 00", addressCountry: "CZ" },
    knowsLanguage: ["cs", "vi"],
    knowsAbout: ["Airbnb", "Booking.com", lang === "cs" ? "krátkodobý pronájem" : "cho thuê ngắn hạn"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: pageName("home", lang),
      itemListElement: [service("sprava"), service("vlastni-provoz")],
    },
  };
  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE}/`,
    name: "Antam Homes",
    inLanguage: ["cs-CZ", "vi-VN"],
    publisher: { "@id": BUSINESS_ID },
  };
  const webpage = {
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: meta[lang].title,
    description: meta[lang].desc,
    inLanguage,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": BUSINESS_ID },
    primaryImageOfPage: ogImage,
  };
  const breadcrumb =
    page === "home"
      ? []
      : [
          {
            "@type": "BreadcrumbList",
            "@id": `${canonical}#breadcrumb`,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Antam Homes", item: home },
              { "@type": "ListItem", position: 2, name: pageName(page, lang), item: canonical },
            ],
          },
        ];
  return { "@context": "https://schema.org", "@graph": [business, website, webpage, ...breadcrumb] };
};

export const SEO = ({ page }: { page: PageKey }) => {
  const { lang } = useLanguage();

  const meta = META[page];
  const current = meta[lang];
  const canonical = SITE + pathFor(page, lang);
  const csUrl = SITE + pathFor(page, "cs");
  const viUrl = SITE + pathFor(page, "vi");
  const locale = lang === "cs" ? "cs_CZ" : "vi_VN";
  const altLocale = lang === "cs" ? "vi_VN" : "cs_CZ";
  // 3. 11. 2026: náhled pro sdílení podle jazyka (CZ a VI text v obrázku).
  const ogImage = `${SITE}/${lang === "vi" ? "og-image-vn.jpg" : "og-image.jpg"}?v=3`;

  // Structured data: FAQ rich results + local business card. Kept in sync with
  // the on-page FAQ via translations so Google never sees a mismatch. The pure
  // builders are exported: the build-time prerender (vite.config → entry-ssg)
  // injects the same JSON-LD statically for crawlers that don't run JS.
  const faqJsonLd = buildFaqJsonLd(lang, page);
  const businessJsonLd = buildBusinessJsonLd(lang, page);

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
  }, [lang, page]);

  return null;
};

export default SEO;