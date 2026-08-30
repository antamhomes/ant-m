/**
 * One source of truth for every yield number on the site.
 *
 * Přestavěno 30. 8. 2026: model stojí na TRŽNÍCH datech celých čtvrtí
 * (PriceLabs STR index přes MCP market_research, oficiální hranice čtvrtí
 * z OSM, 12 uzavřených měsíců 8/2025 až 7/2026, surová data v
 * data/pricelabs-2026-08/). Už žádné comp sety vlastních listingů ani
 * paušální obsazenost: kalkulačka říká, co dělá průměrný byt dané čtvrti
 * a velikosti na trhu.
 *
 * ZÁKLAD výpočtu = roční RevPAR čtvrti a pásma (průměr měsíčních RevPAR,
 * tedy průměr součinů ADR × obsazenost, ne součin průměrů; prosinec táhne).
 * SEZÓNY = násobky RevPAR i ADR z týchž měsíčních řad, vážené počtem
 * nabídek přes pásma; 7×léto + 4×zima + 1×prosinec = 12×rok PŘESNĚ.
 * OBSAZENOST ve výsledku = RevPAR / ADR, tedy tržní průměr čtvrti.
 *
 * Buňku ukazujeme jen při průměrně ≥ 50 aktivních nabídkách a bez anomálií
 * (P3/P4/P6/P7/P9 mají tenká pásma, viz poznámky v datech). Praha 10 čeká
 * na doplnění dat (rate limit 30. 8.), do té doby „posoudíme individuálně“.
 * Nikdy neopisovat čísla jedné čtvrti do jiné.
 */

export type SizeKey = "1kk" | "2kk" | "3kk" | "4kk";
export type LocationKey =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9" | "praha10";

/** Kapacitní pásmo: host na Airbnb filtruje podle počtu osob, ne dispozice. */
export type Band = "1BR" | "2BR" | "3BR";
export const bandFor = (guests: number): Band =>
  guests <= 4 ? "1BR" : guests <= 8 ? "2BR" : "3BR";

/** Čtvrti, kde má trh dost velký vzorek na aspoň jedno pásmo. */
export type MeasuredLocation =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9";
export const isMeasured = (loc: string): loc is MeasuredLocation =>
  loc in MARKET_STR;

/**
 * Tržní data čtvrti po pásmech (PriceLabs STR index, 8/2025 až 7/2026,
 * oficiální hranice čtvrti; zdroj: data/pricelabs-2026-08/*.json).
 * adr = roční průměr realizovaného ADR (Kč/noc), revpar = průměr měsíčních
 * RevPAR (Kč/noc na dostupnou noc), listings = průměr aktivních nabídek
 * (velikost vzorku). Chybějící pásmo = vzorek pod ~50 nabídek nebo anomálie
 * v řadě, takové číslo NEukazujeme (P1 3BR má 320 nabídek, P9 2BR jen 24).
 */
export const MARKET_STR: Record<MeasuredLocation, Partial<Record<Band, { adr: number; revpar: number; listings: number }>>> = {
  praha1: { "1BR": { adr: 2917, revpar: 2207.5, listings: 1675 }, "2BR": { adr: 4507, revpar: 3399.3, listings: 904 }, "3BR": { adr: 6576, revpar: 4924.8, listings: 320 } },
  praha2: { "1BR": { adr: 2419, revpar: 1739.9, listings: 920 },  "2BR": { adr: 3748, revpar: 2831.4, listings: 361 }, "3BR": { adr: 5874, revpar: 4278.2, listings: 128 } },
  praha3: { "1BR": { adr: 2130, revpar: 1568.9, listings: 626 },  "2BR": { adr: 3085, revpar: 2303.5, listings: 179 } },
  praha4: { "1BR": { adr: 1810, revpar: 1254.0, listings: 184 },  "2BR": { adr: 2539, revpar: 1697.0, listings: 69 } },
  praha5: { "1BR": { adr: 2259, revpar: 1579.7, listings: 452 },  "2BR": { adr: 3378, revpar: 2363.4, listings: 183 }, "3BR": { adr: 5599, revpar: 3710.5, listings: 74 } },
  praha6: { "1BR": { adr: 1873, revpar: 1286.6, listings: 154 },  "2BR": { adr: 2913, revpar: 1878.9, listings: 83 } },
  praha7: { "1BR": { adr: 2105, revpar: 1507.0, listings: 215 },  "2BR": { adr: 3336, revpar: 2087.1, listings: 98 } },
  praha8: { "1BR": { adr: 2532, revpar: 1902.3, listings: 350 },  "2BR": { adr: 3654, revpar: 2508.0, listings: 92 } },
  praha9: { "1BR": { adr: 2065, revpar: 1363.9, listings: 76 } },
};

/**
 * Tržní obsazenost lokality (PriceLabs, posledních 90 dní, průměr přes naše
 * listingy v lokalitě). Jedno číslo na lokalitu, ne na byt: rozdíl 402 vs 405
 * (77,5 vs 77,2 %) je šum per-listing vzorku, ne vlastnost domu.
 * mb = Mladá Boleslav, jen pro karty portfolia; kalkulačka MB nenabízí.
 */
export type CardMarketLocation = "praha1" | "praha3" | "praha4" | "praha5";
export const MARKET_OCC: Record<CardMarketLocation | "mb", number> = {
  praha1: 77, praha3: 73, praha4: 68, praha5: 74, mb: 72,
};

/**
 * Sezónní násobky ADR a RevPAR z tržních měsíčních řad každé čtvrti,
 * vážené počtem nabídek přes spolehlivá pásma. léto = duben až říjen
 * (7 měs.), zima = listopad až březen BEZ prosince (4 měs.), Vánoce =
 * prosinec. Vážený součet dává přesně roční průměr, hlídá to facts.test.ts.
 * RevPAR násobek řídí peníze (nese i sezónní obsazenost), ADR násobek
 * jen zobrazenou cenu za noc.
 */
export type SeasonFactor = { adr: number; revpar: number };
export const SEASONS_BY_LOC: Record<MeasuredLocation, { summer: SeasonFactor; winter: SeasonFactor; xmas: SeasonFactor }> = {
  praha1: { summer: { adr: 1.053, revpar: 1.092 }, winter: { adr: 0.798, revpar: 0.690 }, xmas: { adr: 1.437, revpar: 1.599 } },
  praha2: { summer: { adr: 1.045, revpar: 1.090 }, winter: { adr: 0.809, revpar: 0.691 }, xmas: { adr: 1.448, revpar: 1.603 } },
  praha3: { summer: { adr: 1.040, revpar: 1.086 }, winter: { adr: 0.824, revpar: 0.713 }, xmas: { adr: 1.427, revpar: 1.544 } },
  praha4: { summer: { adr: 1.034, revpar: 1.093 }, winter: { adr: 0.856, revpar: 0.714 }, xmas: { adr: 1.338, revpar: 1.491 } },
  praha5: { summer: { adr: 1.047, revpar: 1.110 }, winter: { adr: 0.820, revpar: 0.678 }, xmas: { adr: 1.389, revpar: 1.521 } },
  praha6: { summer: { adr: 1.031, revpar: 1.110 }, winter: { adr: 0.892, revpar: 0.727 }, xmas: { adr: 1.215, revpar: 1.322 } },
  praha7: { summer: { adr: 1.021, revpar: 1.089 }, winter: { adr: 0.861, revpar: 0.707 }, xmas: { adr: 1.408, revpar: 1.548 } },
  praha8: { summer: { adr: 1.036, revpar: 1.084 }, winter: { adr: 0.815, revpar: 0.697 }, xmas: { adr: 1.490, revpar: 1.624 } },
  praha9: { summer: { adr: 1.013, revpar: 1.067 }, winter: { adr: 0.922, revpar: 0.784 }, xmas: { adr: 1.219, revpar: 1.393 } },
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
 * Obsazenost v kalkulačce od 30. 8. 2026 NENÍ paušál: každá buňka čtvrť ×
 * pásmo nese tržní průměr své čtvrti (RevPAR / ADR, viz MARKET_STR), takže
 * výsledek je obhajitelný benchmark trhu. Že byty v naší správě jedou nad
 * trhem (85 až 97 %), říkají karty Portfolia, ne kalkulačka.
 */

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
 * Tržní RevPAR čtvrti a pásma × sezónní násobek RevPAR té čtvrti × dny
 * = hrubé tržby; z nich se odečte provize platformy (počítá se z celé ceny
 * rezervace včetně úklidu), zbytek se dělí 70/30. Zobrazené ADR nese
 * sezónní násobek ADR a obsazenost je z toho dopočtená (RevPAR / ADR),
 * takže vždy sedí na tržní průměr čtvrti. DPH z provize neodečítáme,
 * hradí ji Antam ze své odměny. Energie majitel platí zvlášť a nejsou tu.
 *
 * Když pro čtvrť nebo pásmo tržní vzorek nestačí, vrací { supported: false }
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
  const cell = MARKET_STR[location][band];
  if (!cell) return { supported: false, band, guests };
  const f = season === "year"
    ? { adr: 1, revpar: 1 }
    : SEASONS_BY_LOC[location][season];
  const adr = Math.round(cell.adr * f.adr);
  const revpar = cell.revpar * f.revpar;
  const occupancy = Math.round((revpar / adr) * 100) / 100;
  const gross = Math.round(revpar * DAYS);
  const platformFee = Math.round(PLATFORM_FEE * gross);
  const netRevenue = gross - platformFee;
  const mgmt = Math.round(netRevenue * MGMT_FEE);
  return {
    supported: true,
    adr, occupancy, gross, platformFee, netRevenue, mgmt,
    net: netRevenue - mgmt, guests, band,
  };
}
