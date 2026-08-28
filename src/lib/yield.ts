/**
 * One source of truth for every yield number on the site.
 *
 * Kalibrováno 27. 8. 2026 proti skutečným datům, ne proti tržnímu průměru:
 * Hospitable (byt 302, 12 měsíců, 143 rezervací, 341 nocí) + PriceLabs ADR,
 * obsazenost a percentily okolních nabídek. Dvě zjištění, která starou tabulku
 * opravila: (1) mezi vnějšími čtvrtěmi je na krátkodobém pronájmu mnohem menší
 * rozdíl než na nájmu, (2) obsazenost spravovaných bytů je 83–92 %, ne 68–85 %.
 *
 * Pravidlo pro tyto hodnoty: vlastní portfolio musí veřejné číslo PŘEKONAT.
 * Kontrola 27. 8. 2026 proti skutečným rezervacím: byt 302 vynesl majiteli za
 * 12 měsíců 56 793 Kč měsíčně, model pro Prahu 1 2+kk dává 48 tis., tedy 15 % pod
 * měřenou skutečností.
 *
 * Kalkulačka i graf horizontu čtou odsud, aby se nikdy nerozešly.
 */

export type SizeKey = "1kk" | "2kk" | "3kk" | "4kk";
export type LocationKey =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9" | "praha10";

/** multiplier = cenová hladina čtvrti, occupancy = obsazenost před sezónní úpravou */
export const DISTRICTS: Record<LocationKey, { multiplier: number; occupancy: number }> = {
  praha1:  { multiplier: 1.20, occupancy: 0.88 },
  praha2:  { multiplier: 1.15, occupancy: 0.86 },
  praha3:  { multiplier: 1.15, occupancy: 0.84 },
  praha4:  { multiplier: 1.02, occupancy: 0.80 },
  praha5:  { multiplier: 1.00, occupancy: 0.82 },
  praha6:  { multiplier: 1.00, occupancy: 0.80 },
  praha7:  { multiplier: 1.10, occupancy: 0.84 },
  praha8:  { multiplier: 0.95, occupancy: 0.78 },
  praha9:  { multiplier: 0.90, occupancy: 0.76 },
  praha10: { multiplier: 0.95, occupancy: 0.78 },
};

/** ADR po provizi platformy; hrubé tržby se dopočítávají přes PLATFORM_FEE */
export const BASE_ADR: Record<SizeKey, number> = {
  "1kk": 1580, "2kk": 2150, "3kk": 2900, "4kk": 3900,
};

/** Dlouhodobý nájem, Kč/měs — odvozeno z LTR_PER_M2 × MEDIAN_AREA × SIZE_COEF */
/**
 * Dlouhodobý nájem. Přestavěno 28. 8. 2026 ze dvou veřejných zdrojů:
 *
 * ÚROVEŇ (Kč/m²/měs) = Deloitte Rent Index Q2/2026, po městských částech.
 * Měří inzeráty, které se skutečně pronajaly. Pražský průměr 462 Kč/m².
 *
 * TVAR (rozdíl mezi dispozicemi) = cenová mapa nájemního bydlení Ministerstva
 * financí, vydání 15. 8. 2026. Menší byt má vyšší Kč/m². Poměr k 2+kk vyšel
 * napříč katastry stabilní (Nové Město, Vinohrady, Žižkov, Smíchov):
 * 1+kk 1,18× · 2+kk 1,00× · 3+kk 0,90× · 4+ 0,89×.
 *
 * PLOCHA = medián výměr nájemních bytů v Praze podle MF: 35 / 53 / 71 / 88 m².
 *
 * Dřív se citovala cenová mapa jednoho z konkurentů, což je jen přebalené
 * starší vydání té samé mapy MF. Tohle jsou primární zdroje.
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
/** Nájem konkrétní plochy v dané lokalitě. Kalkulačka i karty počítají odsud. */
export const rentFor = (loc: LocationKey, size: SizeKey, m2 = MEDIAN_AREA[size]) =>
  Math.round(m2 * LTR_PER_M2[loc] * SIZE_COEF[size]);

export const LTR: Record<LocationKey, Record<SizeKey, number>> = {
  praha1:  { "1kk": 20000, "2kk": 26000, "3kk": 31500, "4kk": 38500 },
  praha2:  { "1kk": 20000, "2kk": 25500, "3kk": 31000, "4kk": 38000 },
  praha3:  { "1kk": 20000, "2kk": 25500, "3kk": 30500, "4kk": 37500 },
  praha4:  { "1kk": 18500, "2kk": 23500, "3kk": 28500, "4kk": 34500 },
  praha5:  { "1kk": 19000, "2kk": 24500, "3kk": 29500, "4kk": 36000 },
  praha6:  { "1kk": 19000, "2kk": 24000, "3kk": 29000, "4kk": 35500 },
  praha7:  { "1kk": 20500, "2kk": 26000, "3kk": 31500, "4kk": 38500 },
  praha8:  { "1kk": 19000, "2kk": 24500, "3kk": 29500, "4kk": 36500 },
  praha9:  { "1kk": 19500, "2kk": 25000, "3kk": 30000, "4kk": 36500 },
  praha10: { "1kk": 18500, "2kk": 23500, "3kk": 28000, "4kk": 34500 },
};

/** Zálohy na energie, které u krátkodobého pronájmu hradí majitel (u nájmu nájemce) */
export const ENERGY: Record<SizeKey, number> = {
  "1kk": 2500, "2kk": 3500, "3kk": 4500, "4kk": 5500,
};

export const ROOMS: Record<SizeKey, number> = { "1kk": 1, "2kk": 2, "3kk": 3, "4kk": 4 };

/**
 * Krytí menších škod způsobených hostem, roční limit na byt: 5 000 Kč za pokoj,
 * nejvýše 25 000 Kč. Platí na to, co se nepodaří získat po hostovi ani přes
 * platformu. Jediné místo, kde tohle pravidlo žije: kalkulačka, kopie i MCP
 * z něj vycházejí, aby se čísla nikdy nerozešla.
 */
export const DAMAGE_COVER_PER_ROOM = 5000;
export const DAMAGE_COVER_MAX = 25000;
export const annualDamageCover = (rooms: number) =>
  Math.min(Math.max(0, Math.round(rooms)) * DAMAGE_COVER_PER_ROOM, DAMAGE_COVER_MAX);

/**
 * Obsazenost jednotlivých bytů proti jejich vlastnímu trhu. Přepočteno 28. 8. 2026.
 *
 * occupancy: z rezervací v Hospitable. Počítají se jen byty starší tří měsíců
 * a okno začíná 46. dnem provozu, aby rozjezd nestahoval číslo dolů; konec okna
 * 31. 7. 2026. obsazenost = obsazené noci v okně / dní okna.
 *
 * market: PriceLabs, srovnatelné byty ve STEJNÉ čtvrti, posledních 90 dní.
 * Každá lokalita má svoje číslo, jedno společné by bylo špatně: Praha 1 jede
 * 77 až 78 %, Praha 5 74 %, Praha 3 71 až 75 %, Mladá Boleslav 72 %. Okno
 * trhu je kratší a padne do sezóny, takže je pro trh spíš příznivé; srovnání
 * tím vychází konzervativně v náš neprospěch, což je správný směr.
 *
 * Byt 302 (Praha 1) měří 93 % proti trhu 78 %, ale publikovaný není.
 * Karty v PortfolioSection musí ukazovat stejná čísla; hlídá to facts.test.ts.
 */
export const OCCUPANCY_BY_FLAT: {
  name: string; loc: string; kat?: string; m2: number; occupancy: number; market: number; days: number;
}[] = [
  { name: "Elegant Museum View\u00a0Apartment", loc: "Praha 1", kat: "Nové Město",        m2: 52, occupancy: 96, market: 78, days: 319 },
  { name: "Modern Museum View\u00a0Apartment",  loc: "Praha 1", kat: "Nové Město",        m2: 52, occupancy: 94, market: 77, days: 318 },
  { name: "Modern AC\u00a0Apartment",           loc: "Praha 3", kat: "Žižkov",        m2: 55, occupancy: 96, market: 75, days: 139 },
  { name: "Moderní apartmán se\u00a0zahradou",  loc: "Praha 3", kat: "Žižkov",        m2: 60, occupancy: 85, market: 71, days: 54 },
  { name: "Klement apartment s\u00a0terasou",   loc: "Mladá Boleslav", kat: "Mladá Boleslav", m2: 85, occupancy: 91, market: 72, days: 54 },
  { name: "My Mozart studio",                loc: "Praha 5", kat: "Smíchov",        m2: 40, occupancy: 97, market: 74, days: 113 },
];

/** Vážený průměr naší obsazenosti: 1 240 obsazených nocí z 1 317 dní okna. */
export const OCCUPANCY_OURS = 94;

/**
 * Cena za noc na trhu. Medián srovnatelných nabídek v okolí konkrétního bytu
 * (PriceLabs, 28. 8. 2026). Sondy jsme dělali přes vlastní listingy, takže
 * měřeno máme jen Prahu 1, 3 a 5. Ostatní čtvrti dostávají konzervativně
 * úroveň Prahy 3, tedy nejnižší naměřenou; kalkulačka to u nich napíše.
 *
 * Pásmo se vybírá podle KAPACITY, ne podle dispozice: host na Airbnb filtruje
 * podle počtu osob. 2+kk s osmi lůžky se srovnává s 2BR nabídkami, ne s 1BR.
 *
 * Ověřeno zpětně: cena za noc × skutečná obsazenost × (1 − provize) sedí
 * na bytě 402 na 0,3 % a na bytě se zahradou na 0,8 % proti Hospitable.
 */
export type AdrBand = "1BR" | "2BR" | "3BR";
const ADR_P3: Record<AdrBand, number> = { "1BR": 2037, "2BR": 2792, "3BR": 2910 };
export const MARKET_ADR: Record<LocationKey, Record<AdrBand, number>> = {
  praha1:  { "1BR": 2767, "2BR": 3775, "3BR": 6047 },
  praha3:  ADR_P3,
  praha5:  { "1BR": 2265, "2BR": 3011, "3BR": 3011 },
  praha2: ADR_P3, praha4: ADR_P3, praha6: ADR_P3,
  praha7: ADR_P3, praha8: ADR_P3, praha9: ADR_P3, praha10: ADR_P3,
};
/** Čtvrti, kde máme vlastní měření; u ostatních je číslo konzervativní náhrada. */
export const ADR_MEASURED: LocationKey[] = ["praha1", "praha3", "praha5"];
export const guestBand = (guests: number): AdrBand =>
  guests <= 4 ? "1BR" : guests <= 8 ? "2BR" : "3BR";

/**
 * Obsazenost, se kterou počítá kalkulačka. Schválně pod tím, co byty reálně
 * drží (94 %), aby veřejné číslo zůstalo pod skutečností. Kalkulačka to
 * návštěvníkovi napíše a odkáže na karty, kde je naše obsazenost vidět.
 *
 * Proč 84 a ne 85: při 85 % model přestřelí byt se zahradou o 0,4 % a porušil
 * by tím pravidlo, že vlastní portfolio musí veřejné číslo překonat. Byt se
 * zahradou je nejtěsnější, drží tenhle strop. Hlídá to facts.test.ts.
 */
export const CALC_OCCUPANCY = 0.84;

/** Kapacita a plocha, kterou dispozice předvyplní. Obojí jde přepsat. */
export const SIZE_PRESET: Record<SizeKey, { m2: number; guests: number }> = {
  "1kk": { m2: 35, guests: 4 },
  "2kk": { m2: 53, guests: 6 },
  "3kk": { m2: 71, guests: 8 },
  "4kk": { m2: 88, guests: 10 },
};

export const MGMT_FEE = 0.28;      // odměna Antam Homes z čistého výnosu
// Změřeno 27. 8. 2026 na 7 bytech (Hospitable, 12 měsíců): skutečná provize je
// 17,3 až 20,6 % z ceny pokoje, podle listingu, ne podle platformy. Airbnb 15,4–20,7 %,
// Booking 18,1–21,4 %. Jedna sazba to nikdy nevystihne; 0,17 je střed měřeného pásma.
// Pozn.: BASE_ADR je cena po provizi, takže se změna sazby z větší části vykrátí
// v dopočtu hrubých tržeb a na výsledek má vliv pod 0,5 %.
export const PLATFORM_FEE = 0.17;
export const CLEANING_SHARE = 0.10;// podíl úklidových poplatků na tržbách (jen pro odpočet provize)
// DPH z provize platformy nese Antam ze své odměny
// (od 28. 8. 2026 je odměna 28 %, na tomhle se nic nemění),
// takže do výpočtu výnosu majitele NEVSTUPUJE. Zůstává tu jen pro interní propočty.
export const VAT_RATE = 1.21;
export const DAYS = 30.44;  // průměrná délka měsíce

/** Uvedení do provozu, vybavení a obnova — vstupy pro graf horizontu */
export const LAUNCH_FEE = 25000;
export const KIT_PER_ROOM = 30000;    // dovybavení bytu zařízeného pro nájemníka
export const EMPTY_PER_ROOM = 100000; // kompletní vybavení prázdného bytu
export const RENEW_PER_ROOM_YEAR = 4000;
export const YEAR_ONE_RAMP = 0.85;    // nová nabídka nenajede hned na plný výkon

/**
 * Roční růst pro pětiletý horizont. Schválně proti nám: nájmy v Praze rostou
 * rychleji než krátkodobý pronájem.
 *
 * RENT_GROWTH 5 %: CEMAP +5,8 %, Sreality +5 %, RealityMIX +3,8 %, ČSÚ nájemné
 * +6,1 %, Deloitte implikuje 7 až 8 %. Pět měření, střed pásma.
 *
 * STR_GROWTH 3 %: pražské hotely v korunách +3 až 4 % ADR. Čísla, která hlásí
 * AirDNA a spol., jsou v dolarech a dolar za dva roky spadl vůči koruně o deset
 * procent, takže v korunách je jejich růst nula. Nabídka navíc roste rychleji
 * než poptávka (ČSÚ: přenocování v Praze +2,9 % za 1. pololetí 2026).
 */
export const RENT_GROWTH = 0.05;
export const STR_GROWTH = 0.03;
export const PROJECT_FEE = 0.20;           // odměna za řízení projektu, z rozpočtu
export const PROJECT_FEE_THRESHOLD = 30000;// pod tímto rozpočtem je řízení v ceně uvedení do provozu

export const clampOccupancy = (v: number) => Math.max(0.5, Math.min(0.98, v));

/**
 * Výnos majitele za měsíc: z hrubých tržeb se odečte provize platformy (počítá se
 * z celé ceny rezervace včetně úklidu), zbytek se dělí 72/28. DPH z provize se
 * neodečítá, hradí ji Antam ze své odměny.
 * Energie NEjsou odečteny — hradí je majitel zvlášť.
 */
/**
 * Výnos majitele za měsíc.
 *
 * Od 28. 8. 2026 nestojí na vlastní tabulce ADR, ale na tržní ceně za noc
 * (MARKET_ADR) a pevné obsazenosti CALC_OCCUPANCY. Z hrubých tržeb se odečte
 * provize platformy, zbytek se dělí podle MGMT_FEE. DPH z provize neodečítáme,
 * hradí ji Antam ze své odměny. Energie majitel platí zvlášť a nejsou tu.
 *
 * guests řídí, s jakým pásmem nabídek se byt srovnává. Dispozice do výpočtu
 * nevstupuje, jen předvyplňuje kapacitu přes SIZE_PRESET.
 */
export function ownerMonthly(
  location: LocationKey,
  sizeOrGuests: SizeKey | number,
  { adrAdjust = 1, occDelta = 0, extrasPct = 0 } = {},
) {
  const guests = typeof sizeOrGuests === "number"
    ? sizeOrGuests
    : SIZE_PRESET[sizeOrGuests].guests;
  const marketAdr = MARKET_ADR[location][guestBand(guests)];
  const adrGross = Math.round(marketAdr * (1 + extrasPct) * adrAdjust);
  const occupancy = clampOccupancy(CALC_OCCUPANCY + occDelta);
  const gross = Math.round(adrGross * occupancy * DAYS);
  const platformFee = Math.round(PLATFORM_FEE * gross);
  const netRevenue = gross - platformFee;
  const mgmt = Math.round(netRevenue * MGMT_FEE);
  return {
    adr: adrGross, occupancy, gross, platformFee, netRevenue, mgmt,
    net: netRevenue - mgmt, guests, band: guestBand(guests),
  };
}
