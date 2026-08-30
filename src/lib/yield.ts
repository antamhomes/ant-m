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
 *
 * Patch 127 (30. 8. 2026, tři vstupy): výsledek má DVĚ čísla ze stejných
 * dat. „Průměr trhu“ = tržní RevPAR čtvrti (reálná tržní cena za noc ×
 * tržní obsazenost). „S Antam Homes“ = táž tržní cena za noc × obsazenost
 * trhu zvednutá o OCC_UPLIFT, nejvýš OCC_CAP (byty v naší správě měří 85
 * až 97 % proti trhu 68 až 77 %, tedy ×1,25; násobek 1,15 je záměrně pod
 * tím). Pásmo se bere z DISPOZICE (počet ložnic, stejně jako PriceLabs),
 * ne z počtu hostů. Nájem se řídí jen plochou (koeficient MF interpolovaný
 * podle m², ne podle nálepky dispozice).
 */

export type SizeKey = "1kk" | "2kk" | "3kk" | "4kk";
export type LocationKey =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9" | "praha10";

/** Pásmo trhu podle počtu ložnic, stejně jako PriceLabs: 1+kk a 2+kk = jedna
 *  ložnice (studio zvlášť trh nevede), 3+kk = dvě, 4+kk a víc = tři a víc. */
export type Band = "1BR" | "2BR" | "3BR";
export const bandFor = (size: SizeKey): Band =>
  size === "1kk" || size === "2kk" ? "1BR" : size === "3kk" ? "2BR" : "3BR";
export const BAND_LABEL: Record<Band, { cs: string; vi: string }> = {
  "1BR": { cs: "1 ložnice", vi: "1 phòng ngủ" },
  "2BR": { cs: "2 ložnice", vi: "2 phòng ngủ" },
  "3BR": { cs: "3+ ložnice", vi: "3+ phòng ngủ" },
};

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
 * Obsazenost, se kterou počítá číslo „s Antam Homes“: tržní obsazenost
 * čtvrti × OCC_UPLIFT, nejvýš OCC_CAP, nikdy pod trhem (v prosinci může trh
 * sám být nad stropem). Byty v naší správě měří 85 až 97 % proti trhu své
 * čtvrti 68 až 77 %, tj. ×1,25; 1,15 je záměrně pod tím.
 */
export const OCC_UPLIFT = 1.15;
export const OCC_CAP = 0.85;
export const antamOccupancy = (marketOcc: number) =>
  Math.max(marketOcc, Math.min(OCC_CAP, marketOcc * OCC_UPLIFT));

/** Tržní obsazenost čtvrti a pásma v procentech (RevPAR / ADR z MARKET_STR),
 *  totéž číslo, které kalkulačka ukazuje jako „obsazenost okolí“. */
export const marketOccPct = (loc: MeasuredLocation, band: Band): number | null => {
  const cell = MARKET_STR[loc][band];
  return cell ? Math.round((cell.revpar / cell.adr) * 100) : null;
};

/**
 * Trh na kartách portfolia: JEDEN zdroj s kalkulačkou (MARKET_STR, 12 měsíců,
 * celá čtvrť, pásmo podle ložnic bytu). Dřív tu bylo 90denní okno comp setů
 * kolem našich listingů (P1 77, P3 73, P5 74), takže stránka měla dvě různá
 * čísla „trhu“ pro tutéž čtvrť. mb = Mladá Boleslav: čtvrťová data nemáme,
 * zůstává PriceLabs comp set 90 dní; jen pro karty, kalkulačka MB nenabízí.
 */
export const MARKET_OCC = {
  praha1: marketOccPct("praha1", "2BR")!,
  praha3: marketOccPct("praha3", "2BR")!,
  praha4: marketOccPct("praha4", "1BR")!,
  praha5: marketOccPct("praha5", "1BR")!,
  mb: 72,
} as const;
export type CardMarketLocation = "praha1" | "praha3" | "praha4" | "praha5";

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
/**
 * Koeficient Kč/m² podle PLOCHY: lineární interpolace mezi mediány MF
 * (35 m² → 1,18 · 53 → 1,00 · 71 → 0,90 · 88 → 0,89), mimo rozsah
 * konstantní. Nálepka dispozice o nájmu nerozhoduje: 52 m² se dvěma
 * ložnicemi (byty 402/405) se pronajme jako 52 m², ne jako „3+kk“.
 */
const AREA_COEF: [number, number][] = [
  [MEDIAN_AREA["1kk"], SIZE_COEF["1kk"]], [MEDIAN_AREA["2kk"], SIZE_COEF["2kk"]],
  [MEDIAN_AREA["3kk"], SIZE_COEF["3kk"]], [MEDIAN_AREA["4kk"], SIZE_COEF["4kk"]],
];
export const areaCoef = (m2: number) => {
  if (m2 <= AREA_COEF[0][0]) return AREA_COEF[0][1];
  for (let i = 1; i < AREA_COEF.length; i++) {
    const [a0, c0] = AREA_COEF[i - 1], [a1, c1] = AREA_COEF[i];
    if (m2 <= a1) return c0 + ((m2 - a0) / (a1 - a0)) * (c1 - c0);
  }
  return AREA_COEF[AREA_COEF.length - 1][1];
};
/** Nájem konkrétní plochy v dané lokalitě. JEDINÁ funkce na nájem na webu.
 *  Dispozice jen dodá výchozí plochu, když m² chybí. */
export const rentFor = (loc: LocationKey, size: SizeKey, m2 = MEDIAN_AREA[size]) =>
  Math.round(m2 * LTR_PER_M2[loc] * areaCoef(m2));

/** Lokalita karty („Praha 1“) → klíč nájmu; Mladá Boleslav nájemní data nemá. */
export const locKeyOf = (loc: string): LocationKey | null => {
  const m = /^Praha (\d+)$/.exec(loc);
  return m ? (`praha${m[1]}` as LocationKey) : null;
};
/** Násobek dlouhodobého nájmu pro kartu: skutečná plocha a čtvrť bytu, na
 *  desetiny. null tam, kde nájemní data nejsou (Mladá Boleslav). */
export const ratioFor = (loc: string, m2: number, ownerMonthlyCzk: number): number | null => {
  const key = locKeyOf(loc);
  if (!key) return null;
  return Math.round((ownerMonthlyCzk / rentFor(key, "2kk", m2)) * 10) / 10;
};

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
 * market: MARKET_OCC lokality, od patche 127 z téhož datasetu jako kalkulačka
 * (celá čtvrť, 12 měsíců, pásmo podle ložnic bytu); MB comp set 90 dní.
 * bedrooms z Hospitable (30. 8. 2026).
 * Byt 302 (Praha 1) měří 93 % proti trhu 77 %, ale publikovaný není.
 * Karty v PortfolioSection musí ukazovat stejná čísla; hlídá to facts.test.ts.
 */
export const OCCUPANCY_BY_FLAT: {
  name: string; loc: string; kat?: string; m2: number; bedrooms: number; occupancy: number; market: number; days: number;
}[] = [
  { name: "Elegant Museum View Apartment", loc: "Praha 1", kat: "Nové Město",        m2: 52, bedrooms: 2, occupancy: 96, market: MARKET_OCC.praha1, days: 319 },
  { name: "Modern Museum View Apartment",  loc: "Praha 1", kat: "Nové Město",        m2: 52, bedrooms: 2, occupancy: 94, market: MARKET_OCC.praha1, days: 318 },
  { name: "Modern AC Apartment",           loc: "Praha 3", kat: "Žižkov",        m2: 55, bedrooms: 2, occupancy: 96, market: MARKET_OCC.praha3, days: 139 },
  { name: "Moderní apartmán se zahradou",  loc: "Praha 3", kat: "Žižkov",        m2: 60, bedrooms: 2, occupancy: 85, market: MARKET_OCC.praha3, days: 54 },
  { name: "Klement apartment s terasou",   loc: "Mladá Boleslav", kat: "Mladá Boleslav", m2: 85, bedrooms: 2, occupancy: 91, market: MARKET_OCC.mb, days: 54 },
  { name: "My Mozart studio",                loc: "Praha 5", kat: "Smíchov",        m2: 40, bedrooms: 1, occupancy: 97, market: MARKET_OCC.praha5, days: 113 },
];

/** Vážený průměr naší obsazenosti: 1 240 obsazených nocí z 1 317 dní okna. */
export const OCCUPANCY_OURS = 94;

/** Plocha, kterou dispozice předvyplní (medián MF); posuvník ji přepíše. */
export const SIZE_PRESET: Record<SizeKey, { m2: number }> = {
  "1kk": { m2: MEDIAN_AREA["1kk"] },
  "2kk": { m2: MEDIAN_AREA["2kk"] },
  "3kk": { m2: MEDIAN_AREA["3kk"] },
  "4kk": { m2: MEDIAN_AREA["4kk"] },
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

/** Jedna varianta výsledku: obsazenost, hrubé tržby, provize, dělení. */
export type Split = {
  occupancy: number; gross: number; platformFee: number;
  netRevenue: number; mgmt: number; net: number;
};
export type OwnerMonthly = {
  supported: true;
  band: Band;
  /** reálná tržní cena za noc (realizované ADR čtvrti a pásma, × sezóna) */
  adr: number;
  /** průměr trhu: tržní RevPAR, tj. tržní cena × tržní obsazenost */
  market: Split;
  /** s Antam Homes: táž cena × antamOccupancy(tržní obsazenost) */
  antam: Split;
} | { supported: false; band: Band };

const split = (gross: number, occupancy: number): Split => {
  const platformFee = Math.round(PLATFORM_FEE * gross);
  const netRevenue = gross - platformFee;
  const mgmt = Math.round(netRevenue * MGMT_FEE);
  return { occupancy, gross, platformFee, netRevenue, mgmt, net: netRevenue - mgmt };
};

/**
 * Výnos majitele za měsíc. JEDINÁ funkce na výnos na webu: kalkulačka,
 * pětiletý graf i MCP počítají odsud.
 *
 * Vstup je dispozice (→ pásmo ložnic) a lokalita; plocha do výnosu nevstupuje.
 * market.gross = tržní RevPAR × sezónní násobek RevPAR × dny (v RevPAR je
 * i tržní obsazenost). antam.gross = tržní ADR × sezónní násobek ADR ×
 * antamOccupancy(tržní obsazenost) × dny. Z hrubého se odečte provize
 * platformy (počítá se z celé ceny rezervace včetně úklidu), zbytek se dělí
 * 70/30. DPH z provize neodečítáme, hradí ji Antam ze své odměny. Energie
 * majitel platí zvlášť a nejsou tu.
 *
 * Když pro čtvrť nebo pásmo tržní vzorek nestačí, vrací { supported: false }
 * a web ukáže „posoudíme individuálně“, nikdy cizí číslo.
 */
export function ownerMonthly(
  location: string,
  size: SizeKey,
  { season = "year" as SeasonKey } = {},
): OwnerMonthly {
  const band = bandFor(size);
  if (!isMeasured(location)) return { supported: false, band };
  const cell = MARKET_STR[location][band];
  if (!cell) return { supported: false, band };
  const f = season === "year"
    ? { adr: 1, revpar: 1 }
    : SEASONS_BY_LOC[location][season];
  const adr = Math.round(cell.adr * f.adr);
  const revpar = cell.revpar * f.revpar;
  const marketOcc = Math.round((revpar / adr) * 1000) / 1000;
  const antamOcc = Math.round(antamOccupancy(marketOcc) * 1000) / 1000;
  return {
    supported: true, band, adr,
    market: split(Math.round(revpar * DAYS), marketOcc),
    antam: split(Math.round(adr * antamOcc * DAYS), antamOcc),
  };
}
