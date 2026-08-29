/**
 * One source of truth for every yield number on the site.
 *
 * Přestavěno 29. 8. 2026 (patch 119): model už nestojí na vlastní tabulce ADR,
 * ale na REALIZOVANÝCH tržních datech z PriceLabs (market_history okolí našich
 * listingů, 12 uzavřených měsíců 8/2025 až 7/2026):
 *
 * ÚROVEŇ ceny za noc = průměr realizovaného tržního ADR srovnatelných bytů
 * v okolí našich listingů v dané lokalitě (ne inzerované ceny).
 * TVAR mezi kapacitními pásmy = poměry nabídkových mediánů podle počtu ložnic
 * (stejný vzor jako nájem: úroveň Deloitte, tvar cenové mapy MF).
 * SEZÓNY = z týchž měsíčních řad; 7×léto + 4×zima + 1×prosinec = 12×rok PŘESNĚ.
 *
 * Data máme jen tam, kde máme vlastní listingy: Praha 1, 3, 4, 5 (a Mladá
 * Boleslav pro karty). Ostatní čtvrti kalkulačka nepočítá a říká to nahlas
 * (stav „posoudíme individuálně“). Nikdy neopisovat čísla jedné čtvrti do jiné.
 *
 * Pravidlo: vlastní portfolio musí veřejné číslo PŘEKONAT. Při obsazenosti 85 %
 * (rozhodnutí majitele 29. 8. 2026) model zůstává pod kartami P1 i P3; Mozart
 * je známá výjimka řešená cenou Mozartu, hlídá ji test.
 */

export type SizeKey = "1kk" | "2kk" | "3kk" | "4kk";
export type LocationKey =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9" | "praha10";

/** Kapacitní pásmo: host na Airbnb filtruje podle počtu osob, ne dispozice. */
export type Band = "1BR" | "2BR" | "3BR";
export const bandFor = (guests: number): Band =>
  guests <= 4 ? "1BR" : guests <= 8 ? "2BR" : "3BR";

/** Lokality, kde máme vlastní listingy, a tedy skutečná tržní data. */
export type MeasuredLocation = "praha1" | "praha3" | "praha4" | "praha5";
export const isMeasured = (loc: string): loc is MeasuredLocation =>
  loc === "praha1" || loc === "praha3" || loc === "praha4" || loc === "praha5";

/**
 * Realizované tržní ADR (Kč/noc, roční průměr 8/2025 až 7/2026) po pásmech.
 * Kotvy = market_history comp setů našich listingů (PriceLabs, 29. 8. 2026):
 * P1 2BR 3 642 (402+405), P3 2BR 2 774 (Modern AC + byt se zahradou),
 * P4 1BR 2 047 (SG Studio), P4 3BR 3 882 (SG Loft), P5 1BR 2 304 (Mozart).
 * Dopočtená pásma přes poměry nabídkových mediánů (P1 1BR/2BR 2789/3793 atd.).
 * Chybějící hodnota = vzorek pod ~25 srovnatelných nabídek (P1 3BR: 6 komp,
 * P3 3BR: 13), takové číslo NEukazujeme.
 */
export const MEASURED_ADR: Record<MeasuredLocation, Partial<Record<Band, number>>> = {
  praha1: { "1BR": 2678, "2BR": 3642 },
  praha3: { "1BR": 1949, "2BR": 2774 },
  praha4: { "1BR": 2047, "2BR": 2687, "3BR": 3882 },
  praha5: { "1BR": 2304, "2BR": 3062 },
};

/**
 * Tržní obsazenost lokality (PriceLabs, posledních 90 dní, průměr přes naše
 * listingy v lokalitě). Jedno číslo na lokalitu, ne na byt: rozdíl 402 vs 405
 * (77,5 vs 77,2 %) je šum per-listing vzorku, ne vlastnost domu.
 * mb = Mladá Boleslav, jen pro karty portfolia; kalkulačka MB nenabízí.
 */
export const MARKET_OCC: Record<MeasuredLocation | "mb", number> = {
  praha1: 77, praha3: 73, praha4: 68, praha5: 74, mb: 72,
};

/**
 * Sezónní násobky ADR z realizovaných měsíčních řad každé lokality.
 * léto = duben až říjen (7 měs.), zima = listopad až březen BEZ prosince
 * (4 měs.), Vánoce = prosinec. Vážený součet dává přesně roční průměr,
 * hlídá to facts.test.ts.
 */
export const SEASONS_BY_LOC: Record<MeasuredLocation, { summer: number; winter: number; xmas: number }> = {
  praha1: { summer: 1.049, winter: 0.789, xmas: 1.500 },
  praha3: { summer: 1.006, winter: 0.906, xmas: 1.330 },
  praha4: { summer: 1.023, winter: 0.897, xmas: 1.249 },
  praha5: { summer: 1.039, winter: 0.829, xmas: 1.412 },
};
export type SeasonKey = "year" | "summer" | "winter" | "xmas";

/**
 * Dlouhodobý nájem. Přestavěno 28. 8. 2026 ze dvou veřejných zdrojů:
 * ÚROVEŇ (Kč/m²/měs) = Deloitte Rent Index Q2/2026 po městských částech
 * (pražský průměr 462 Kč/m²). TVAR = cenová mapa nájemního bydlení MF,
 * vydání 15. 8. 2026: menší byt má vyšší Kč/m².
 * PLOCHA = medián výměr nájemních bytů v Praze podle MF: 35/53/71/88 m².
 */
export const LTR_PER_M2: Record<LocationKey, number> = {
  praha1: 490, praha2: 482, praha3: 480, praha4: 443, praha5: 461,
  praha6: 454, praha7: 493, praha8: 465, praha9: 468, praha10: 442,
};
/** Násobek Kč/m² podle dispozice, vztaženo k 2+kk (zdroj: cenová mapa MF). */
export const SIZE_COEF: Record<SizeKey, number> = {
  "1kk": 1.18, "2kk": 1.00, "3kk": 0.90, "4kk": 0.89,
};
/** Medián výměry nájemního bytu v Praze podle MF, v m². */
export const MEDIAN_AREA: Record<SizeKey, number> = {
  "1kk": 35, "2kk": 53, "3kk": 71, "4kk": 88,
};
/** Nájem konkrétní plochy v dané lokalitě. JEDINÁ funkce na nájem na webu. */
export const rentFor = (loc: LocationKey, size: SizeKey, m2 = MEDIAN_AREA[size]) =>
  Math.round(m2 * LTR_PER_M2[loc] * SIZE_COEF[size]);

/** Zálohy na energie, které u krátkodobého pronájmu hradí majitel (u nájmu nájemce) */
export const ENERGY: Record<SizeKey, number> = {
  "1kk": 2500, "2kk": 3500, "3kk": 4500, "4kk": 5500,
};

export const ROOMS: Record<SizeKey, number> = { "1kk": 1, "2kk": 2, "3kk": 3, "4kk": 4 };

/**
 * Krytí menších škod způsobených hostem, roční limit na byt: 5 000 Kč za pokoj,
 * nejvýše 25 000 Kč. Platí na to, co se nepodaří získat po hostovi ani přes
 * platformu. Jediné místo, kde tohle pravidlo žije.
 */
export const DAMAGE_COVER_PER_ROOM = 5000;
export const DAMAGE_COVER_MAX = 25000;
export const annualDamageCover = (rooms: number) =>
  Math.min(Math.max(0, Math.round(rooms)) * DAMAGE_COVER_PER_ROOM, DAMAGE_COVER_MAX);

/**
 * Obsazenost jednotlivých bytů proti trhu jejich lokality.
 * occupancy: z rezervací v Hospitable (byty starší tří měsíců, okno od 46. dne
 * provozu do 31. 7. 2026) — NAMĚŘENÁ ČÍSLA, nesahat.
 * market: MARKET_OCC lokality (PriceLabs, 90 dní), od patche 119 po lokalitách.
 * Byt 302 (Praha 1) měří 93 % proti trhu 77 %, ale publikovaný není.
 * Karty v PortfolioSection musí ukazovat stejná čísla; hlídá to facts.test.ts.
 */
export const OCCUPANCY_BY_FLAT: {
  name: string; loc: string; kat?: string; m2: number; occupancy: number; market: number; days: number;
}[] = [
  { name: "Elegant Museum View Apartment", loc: "Praha 1", kat: "Nové Město",        m2: 52, occupancy: 96, market: MARKET_OCC.praha1, days: 319 },
  { name: "Modern Museum View Apartment",  loc: "Praha 1", kat: "Nové Město",        m2: 52, occupancy: 94, market: MARKET_OCC.praha1, days: 318 },
  { name: "Modern AC Apartment",           loc: "Praha 3", kat: "Žižkov",        m2: 55, occupancy: 96, market: MARKET_OCC.praha3, days: 139 },
  { name: "Moderní apartmán se zahradou",  loc: "Praha 3", kat: "Žižkov",        m2: 60, occupancy: 85, market: MARKET_OCC.praha3, days: 54 },
  { name: "Klement apartment s terasou",   loc: "Mladá Boleslav", kat: "Mladá Boleslav", m2: 85, occupancy: 91, market: MARKET_OCC.mb, days: 54 },
  { name: "My Mozart studio",                loc: "Praha 5", kat: "Smíchov",        m2: 40, occupancy: 97, market: MARKET_OCC.praha5, days: 113 },
];

/** Vážený průměr naší obsazenosti: 1 240 obsazených nocí z 1 317 dní okna. */
export const OCCUPANCY_OURS = 94;

/**
 * Obsazenost, se kterou počítá kalkulačka: 85 % (rozhodnutí majitele
 * 29. 8. 2026). Trh v našich lokalitách jede 64 až 78 %, naše byty 85 až 97 %;
 * 85 % je spodek toho, co spravované byty drží. Věta u výsledku to říká.
 * Mozart (34 636 model vs 30 000 karta) je známá výjimka, hlídá ji test.
 */
export const CALC_OCCUPANCY = 0.85;

/** Kapacita a plocha, kterou dispozice předvyplní. Obojí jde přepsat. */
export const SIZE_PRESET: Record<SizeKey, { m2: number; guests: number }> = {
  "1kk": { m2: 35, guests: 4 },
  "2kk": { m2: 53, guests: 6 },
  "3kk": { m2: 71, guests: 8 },
  "4kk": { m2: 88, guests: 10 },
};

export const MGMT_FEE = 0.30;      // odměna Antam Homes z čistého výnosu
// Změřeno 27. 8. 2026 na 7 bytech (Hospitable, 12 měsíců): skutečná provize je
// 17,3 až 20,6 % z ceny pokoje podle listingu. 0,17 je dolní okraj měřeného
// pásma, tedy záměrně optimistická strana; disclaimer uvádí pásmo 15 až 21 %.
export const PLATFORM_FEE = 0.17;
export const DAYS = 30.44;  // průměrná délka měsíce

/** Uvedení do provozu, vybavení a obnova — vstupy pro záložku Za 5 let */
export const LAUNCH_FEE = 25000;
export const KIT_PER_ROOM = 30000;    // dovybavení bytu zařízeného pro nájemníka
export const EMPTY_PER_ROOM = 100000; // kompletní vybavení prázdného bytu
export const RENEW_PER_ROOM_YEAR = 4000;
export const YEAR_ONE_RAMP = 0.85;    // nová nabídka nenajede hned na plný výkon

/**
 * Roční růst pro pětiletý horizont. Schválně proti nám: nájmy v Praze rostou
 * rychleji než krátkodobý pronájem (CEMAP, Sreality, RealityMIX, ČSÚ, Deloitte
 * vs pražské hotely v korunách).
 */
export const RENT_GROWTH = 0.05;
export const STR_GROWTH = 0.03;
export const PROJECT_FEE = 0.20;           // odměna za řízení projektu, z rozpočtu
export const PROJECT_FEE_THRESHOLD = 30000;// pod tímto rozpočtem je řízení v ceně uvedení do provozu

export type OwnerMonthly = {
  supported: true;
  adr: number; occupancy: number; gross: number; platformFee: number;
  netRevenue: number; mgmt: number; net: number; guests: number; band: Band;
} | { supported: false; band: Band; guests: number };

/**
 * Výnos majitele za měsíc. JEDINÁ funkce na výnos na webu: kalkulačka,
 * záložka Za 5 let i MCP počítají odsud.
 *
 * Realizované tržní ADR lokality a pásma × sezónní násobek té lokality
 * × obsazenost 85 % × dny; z hrubých tržeb se odečte provize platformy
 * (počítá se z celé ceny rezervace včetně úklidu), zbytek se dělí 70/30.
 * DPH z provize neodečítáme, hradí ji Antam ze své odměny. Energie majitel
 * platí zvlášť a nejsou tu.
 *
 * Když pro lokalitu nebo pásmo data nemáme, vrací { supported: false }
 * a web ukáže „posoudíme individuálně“, nikdy cizí číslo.
 */
export function ownerMonthly(
  location: string,
  sizeOrGuests: SizeKey | number,
  { season = "year" as SeasonKey } = {},
): OwnerMonthly {
  const guests = typeof sizeOrGuests === "number"
    ? sizeOrGuests
    : SIZE_PRESET[sizeOrGuests].guests;
  const band = bandFor(guests);
  if (!isMeasured(location)) return { supported: false, band, guests };
  const baseAdr = MEASURED_ADR[location][band];
  if (!baseAdr) return { supported: false, band, guests };
  const factor = season === "year" ? 1 : SEASONS_BY_LOC[location][season];
  const adr = Math.round(baseAdr * factor);
  const occupancy = CALC_OCCUPANCY;
  const gross = Math.round(adr * occupancy * DAYS);
  const platformFee = Math.round(PLATFORM_FEE * gross);
  const netRevenue = gross - platformFee;
  const mgmt = Math.round(netRevenue * MGMT_FEE);
  return {
    supported: true,
    adr, occupancy, gross, platformFee, netRevenue, mgmt,
    net: netRevenue - mgmt, guests, band,
  };
}
