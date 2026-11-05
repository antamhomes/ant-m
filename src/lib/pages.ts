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
/**
 * 5. 11. 2026: vietnamská verze zrušena a /sprava zrušena (správa za 20 % už
 * není v nabídce; homepage je nájem na 3 roky). Typ Language zůstává kvůli
 * podpisům funkcí, cesty jsou jen české. Staré adresy (/vn, /sprava a jejich
 * kombinace) vedou na homepage, ať sdílené odkazy nekončí na 404.
 */
export type Language = "cs" | "vi";
export type PageKey = "home" | "sprava" | "vlastni-provoz";

export const PAGES: readonly PageKey[] = ["home", "vlastni-provoz"] as const;

const SLUG: Record<PageKey, string> = { home: "", sprava: "", "vlastni-provoz": "vlastni-provoz" };

/** Kanonická cesta stránky, bez koncového lomítka (kromě "/"). Jazyk se ignoruje. */
export const pathFor = (page: PageKey, _lang?: Language): string => {
  const slug = SLUG[page];
  return slug ? `/${slug}` : "/";
};

/** Normalizace: malá písmena, bez koncového lomítka, bez /index.html. */
export const normalizePath = (pathname: string): string => {
  let p = pathname.toLowerCase().replace(/\/index\.html$/, "");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
};

const ALIASES: Record<string, string> = {
  "/cz": "/", "/cs": "/", "/vi": "/", "/vn": "/", "/sprava": "/", "/vn/sprava": "/",
  "/vn/vlastni-provoz": "/vlastni-provoz", "/najem": "/",
};

/**
 * Krátké odkazy na sekci (3. 11. 2026): /kalkulacka a /vn/kalkulacka vedou na
 * kalkulačku na homepage. Sdílené odkazy (Facebook, vizitky) tak nekončí na 404.
 */
const SECTION_LINKS: Record<string, { page: PageKey; lang: Language; hash: string }> = {
  "/kalkulacka": { page: "home", lang: "cs", hash: "splatka" },
  "/vn/kalkulacka": { page: "home", lang: "cs", hash: "splatka" },
  "/splatka": { page: "home", lang: "cs", hash: "splatka" },
};

/** Stránka a jazyk z cesty; null = 404. Aliasy /cz, /cs, /vi vedou na homepage. */
export const resolvePath = (
  pathname: string,
): { page: PageKey; lang: Language; canonical: string; hash?: string } | null => {
  const link = SECTION_LINKS[normalizePath(pathname)];
  if (link) return { page: link.page, lang: link.lang, canonical: pathFor(link.page, link.lang), hash: link.hash };
  const p = ALIASES[normalizePath(pathname)] ?? normalizePath(pathname);
  for (const page of PAGES)
    if (pathFor(page) === p) return { page, lang: "cs", canonical: p };
  return null;
};

/**
 * Kde která sekce bydlí. Odkaz na sekci z jiné stránky dostane cestu před
 * kotvu; na vlastní stránce zůstane jen kotva (plynulý scroll).
 */
const SECTION_HOME: Record<string, PageKey[]> = {
  jak: ["home"],
  nabidka: ["home"],
  splatka: ["home"],
  kalkulacka: ["home"],
  cenik: ["vlastni-provoz"],
  system: ["vlastni-provoz"],
  "jak-zacina": ["vlastni-provoz"],
  faq: ["home", "vlastni-provoz"],
  srovnani: ["vlastni-provoz"],
  prestavba: ["vlastni-provoz"],
  kontakt: ["home", "vlastni-provoz"],
};

export const sectionHref = (section: string, current: PageKey, lang: Language): string => {
  const homes = SECTION_HOME[section] ?? ["home"];
  if (homes.includes(current)) return `#${section}`;
  return `${pathFor(homes[0], lang)}#${section}`;
};
