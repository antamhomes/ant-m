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

/** Dlouhodobý nájem, Kč/měs — cenová mapa nájemného Bohemian Estates, 11/2025 */
export const LTR: Record<LocationKey, Record<SizeKey, number>> = {
  praha1:  { "1kk": 23000, "2kk": 28000, "3kk": 32000, "4kk": 41500 },
  praha2:  { "1kk": 21500, "2kk": 28000, "3kk": 32500, "4kk": 42500 },
  praha3:  { "1kk": 20500, "2kk": 26500, "3kk": 31000, "4kk": 40500 },
  praha4:  { "1kk": 18000, "2kk": 23000, "3kk": 26000, "4kk": 33500 },
  praha5:  { "1kk": 18500, "2kk": 24500, "3kk": 28000, "4kk": 36000 },
  praha6:  { "1kk": 19000, "2kk": 25500, "3kk": 30000, "4kk": 39000 },
  praha7:  { "1kk": 20000, "2kk": 25500, "3kk": 30500, "4kk": 40000 },
  praha8:  { "1kk": 16000, "2kk": 21500, "3kk": 24000, "4kk": 31000 },
  praha9:  { "1kk": 18500, "2kk": 23500, "3kk": 29000, "4kk": 37500 },
  praha10: { "1kk": 18000, "2kk": 23000, "3kk": 27500, "4kk": 35500 },
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

export const MGMT_FEE = 0.30;      // odměna Antam Homes z čistého výnosu
// Změřeno 27. 8. 2026 na 7 bytech (Hospitable, 12 měsíců): skutečná provize je
// 17,3 až 20,6 % z ceny pokoje, podle listingu, ne podle platformy. Airbnb 15,4–20,7 %,
// Booking 18,1–21,4 %. Jedna sazba to nikdy nevystihne; 0,17 je střed měřeného pásma.
// Pozn.: BASE_ADR je cena po provizi, takže se změna sazby z větší části vykrátí
// v dopočtu hrubých tržeb a na výsledek má vliv pod 0,5 %.
export const PLATFORM_FEE = 0.17;
export const CLEANING_SHARE = 0.10;// podíl úklidových poplatků na tržbách (jen pro odpočet provize)
// DPH z provize platformy. Od přechodu na odměnu 30 % ji nese Antam ze své odměny,
// takže do výpočtu výnosu majitele NEVSTUPUJE. Zůstává tu jen pro interní propočty.
export const VAT_RATE = 1.21;
export const DAYS = 30;

/** Uvedení do provozu, vybavení a obnova — vstupy pro graf horizontu */
export const LAUNCH_FEE = 25000;
export const KIT_PER_ROOM = 30000;    // dovybavení bytu zařízeného pro nájemníka
export const EMPTY_PER_ROOM = 100000; // kompletní vybavení prázdného bytu
export const RENEW_PER_ROOM_YEAR = 4000;
export const YEAR_ONE_RAMP = 0.85;    // nová nabídka nenajede hned na plný výkon
export const PROJECT_FEE = 0.20;           // odměna za řízení projektu, z rozpočtu
export const PROJECT_FEE_THRESHOLD = 30000;// pod tímto rozpočtem je řízení v ceně uvedení do provozu

export const clampOccupancy = (v: number) => Math.max(0.5, Math.min(0.98, v));

/**
 * Výnos majitele za měsíc: z hrubých tržeb se odečte provize platformy (počítá se
 * z celé ceny rezervace včetně úklidu), zbytek se dělí 70/30. DPH z provize se
 * neodečítá, hradí ji Antam ze své odměny.
 * Energie NEjsou odečteny — hradí je majitel zvlášť.
 */
export function ownerMonthly(
  location: LocationKey,
  size: SizeKey,
  { adrAdjust = 1.05, occDelta = 0.02, extrasPct = 0 } = {},
) {
  const d = DISTRICTS[location];
  const adrNet = Math.round(BASE_ADR[size] * d.multiplier * (1 + extrasPct) * adrAdjust);
  const occupancy = clampOccupancy(d.occupancy + occDelta);
  const gross = Math.round((adrNet / (1 - PLATFORM_FEE)) * occupancy * DAYS);
  const platformFee = Math.round(PLATFORM_FEE * gross * (1 + CLEANING_SHARE));
  const netRevenue = gross - platformFee;
  const mgmt = Math.round(netRevenue * MGMT_FEE);
  return { adr: adrNet, occupancy, gross, platformFee, netRevenue, mgmt, net: netRevenue - mgmt };
}
