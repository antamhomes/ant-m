/**
 * Stránky webu (2. 11. 2026): homepage třídí, dvě podstránky prodávají každá
 * jednomu člověku. Jediné místo, kde se vědí cesty, jazykové dvojice a to,
 * na které stránce která sekce bydlí (kvůli odkazům napříč stránkami).
 *
 *   /                 homepage (CZ)           /vn                 (VI)
 *   /sprava           Provozujeme za vás      /vn/sprava
 *   /vlastni-provoz   Provozuji sám           /vn/vlastni-provoz
 *
 * Bez routeru: App.tsx čte window.location.pathname (při prerenderu globál),
 * LanguageContext z něj odvozuje jazyk i stránku.
 */
export type Language = "cs" | "vi";
export type PageKey = "home" | "sprava" | "vlastni-provoz";

export const PAGES: readonly PageKey[] = ["home", "sprava", "vlastni-provoz"] as const;

const SLUG: Record<PageKey, string> = { home: "", sprava: "sprava", "vlastni-provoz": "vlastni-provoz" };

/** Kanonická cesta stránky v jazyce, bez koncového lomítka (kromě "/"). */
export const pathFor = (page: PageKey, lang: Language): string => {
  const slug = SLUG[page];
  if (lang === "vi") return slug ? `/vn/${slug}` : "/vn";
  return slug ? `/${slug}` : "/";
};

/** Normalizace: malá písmena, bez koncového lomítka, bez /index.html. */
export const normalizePath = (pathname: string): string => {
  let p = pathname.toLowerCase().replace(/\/index\.html$/, "");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
};

const ALIASES: Record<string, string> = { "/cz": "/", "/cs": "/", "/vi": "/vn" };

/** Stránka a jazyk z cesty; null = 404. Aliasy /cz, /cs, /vi vedou na homepage. */
export const resolvePath = (pathname: string): { page: PageKey; lang: Language; canonical: string } | null => {
  const p = ALIASES[normalizePath(pathname)] ?? normalizePath(pathname);
  for (const page of PAGES)
    for (const lang of ["cs", "vi"] as const)
      if (pathFor(page, lang) === p) return { page, lang, canonical: p };
  return null;
};

/**
 * Kde která sekce bydlí. Odkaz na sekci z jiné stránky dostane cestu před
 * kotvu; na vlastní stránce zůstane jen kotva (plynulý scroll).
 */
const SECTION_HOME: Record<string, PageKey[]> = {
  kalkulacka: ["home", "sprava"],
  portfolio: ["home", "sprava"],
  cenik: ["home", "sprava", "vlastni-provoz"],
  system: ["vlastni-provoz"],
  "jak-zacina": ["sprava", "vlastni-provoz"],
  faq: ["sprava", "vlastni-provoz"],
  srovnani: ["home", "vlastni-provoz"],
  garance: ["sprava"],
  prestavba: ["vlastni-provoz"],
  kontakt: ["home", "sprava", "vlastni-provoz"],
};

export const sectionHref = (section: string, current: PageKey, lang: Language): string => {
  const homes = SECTION_HOME[section] ?? ["home"];
  if (homes.includes(current)) return `#${section}`;
  return `${pathFor(homes[0], lang)}#${section}`;
};
