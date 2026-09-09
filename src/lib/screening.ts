/**
 * Screeningový vyhodnocovač bytu (fáze 1 podle docs/underwriting-mvp-spec.md).
 *
 * Odpovídá na JEDINOU otázku: stojí ten byt za další práci? Nikdy neříká
 * ACCEPT a nikdy nevydá nabídku. ACCEPT/REVIEW/DECLINE padá až po branách,
 * faktech o bytu a ručních úpravách, tedy ve fázi 2.
 *
 * Dvě a jen dvě odchylky od veřejné cesty:
 *  1. operátorský faktor interní (bez měření 1,00 místo 1,10) — yield.ts,
 *  2. bere se SPODEK rozpětí (`low`), ne střed.
 * AVAILABILITY 0,92 zůstává, to není opatrnost, ale převod RevPAR na tržbu.
 *
 * OPRAVA SPECU 9. 9. 2026. Spec §5.2 bod 2 zněl „band blend na spodní hraně,
 * weight = 0“. Implementováno doslova to znamenalo vnutit ZÁKLADNÍ pásmo, a
 * protože 2+kk má base 1BR a překlápí se do 2BR podle m², počítal se každý
 * 2+kk jako jednoložnicový. Na deseti fixturách z toho vyšlo devět červených
 * a Staré Město 2+kk mělo rezervu −1 %, což je zjevný nesmysl.
 * Překlopení podle m² NENÍ optimismus, je to čtení kapacity z plochy, tedy
 * informace. Konzervativní je vzít spodek výsledného rozpětí (`low`, kde už
 * LOW_BLEND krátí překlopení na polovinu), ne zahodit pásmo. 
 *
 * Konzervativní je ZÁMĚRNĚ jen strana výnosu. Podlaha se počítá středem trhu
 * (furn "mix"), protože opatrnost na obou stranách by se násobila a udělala
 * by z většiny Prahy červenou.
 */
import {
  ownerMonthly, rentFor, marketCell, isMeasured, isReliableN, RELIABLE_MIN_N,
  BAND_BLEND, ENERGY, CALC_MODEL_VERSION, OPERATOR_EVIDENCE, operatorFactor,
  ctvrtiOf, typicalArea, bandFor, BAND_LABEL,
  type SizeKey, type LocationKey, type MeasuredLocation, type Band,
  type SeasonKey, type ObservedConfig,
} from "./yield";
import { dataWindowLabel } from "./dataWindow";

/** Prahy v0 (rozhodnutí 9. 9. 2026). NELADIT před 20 až 30 vyhodnocenými byty. */
export const WORTH_MIN = 0.35;
export const REVIEW_MIN = 0.10;

export type Verdict = "worth" | "review" | "not_worth";
export type VerdictReason = "thin_evidence" | "marginal_spread" | null;
export type Confidence = "high" | "medium" | "low";

export type ScreeningInput = {
  /** Text tak, jak ho uživatel napsal. Do výpočtu nevstupuje. */
  addressRaw: string;
  district: LocationKey;
  /** id čtvrti z ctvrtiOf(), nebo null pro „Ostatní Praha X“ */
  ctvrt: string | null;
  size: SizeKey;
  m2: number;
  /**
   * Reálná kapacita: kolik lidí se v bytě SKUTEČNĚ vyspí. Když je zadaná,
   * model přestane pásmo hádat z dispozice a plochy a použije `ObservedConfig`,
   * tedy svou vlastní interní cestu. Hýbe to OBĚMA SMĚRY: 2+kk, kde se reálně
   * vyspí jen čtyři, spadne z 2BR na 1BR.
   */
  sleeps?: number | null;
  /** Sezóna. Model ji umí, dosud ji nástroj ignoroval. */
  season?: SeasonKey;
  /** Nepovinné, jen jako druhý srovnávací sloupec. Do verdiktu NEVSTUPUJE. */
  currentRent?: number | null;
};

export type ScreeningResult = {
  supported: boolean;
  modelVersion: string;
  dataWindow: string;
  /** Veřejné číslo pro srovnání. Do verdiktu nevstupuje. */
  publicMonthly: number | null;
  consLow: number | null;
  consHigh: number | null;
  /** Podklad pro screening rizika. NENÍ to očekávaná tržba. */
  screeningBaseline: number | null;
  ltrMonthly: number | null;
  energyMonthly: number;
  floorMonthly: number | null;
  bufferCzk: number | null;
  bufferPct: number | null;
  deltaYear: number | null;
  ratioToRent: number | null;
  band: Band;
  cellDerived: boolean;
  nMin: number | null;
  operatorFactorUsed: number;
  operatorMeasured: boolean;
  confidence: Confidence;
  verdict: Verdict;
  verdictReason: VerdictReason;
  why: string;
  /** `observed` = pásmo ze zadané kapacity, `inferred` = dohad z dispozice a m². */
  capacitySource: "observed" | "inferred";
  /** Pásmo, které by vyšlo z dohadu. Ukazuje, o kolik zadaná kapacita pohnula. */
  inferredBand: Band;
  bandLabel: string;
  season: SeasonKey;
  /** Kapacita, kterou model bere jako danou; null = hádá se z dispozice. */
  sleeps: number | null;
  size: SizeKey;
  /**
   * Umí model kapacitu tohohle bytu vůbec rozlišit?
   *
   * false znamená, že výsledek je HORNÍ ODHAD, ne odhad. Trh nemá pásmo pod
   * 1BR, takže uvnitř něj model nerozliší dva hosty od čtyř: byt pro dva
   * dostane cenu bytu pro čtyři. Není to srážka ani práh, je to konstatování,
   * že důkaz o kapacitě chybí, a chová se stejně jako dopočtená buňka nebo
   * malý vzorek: na zelenou to nestačí.
   */
  capacityResolved: boolean;
};

const round = (n: number) => Math.round(n);

/**
 * Jediná funkce vyhodnocení. Čistá: stejný vstup dá vždy stejný výstup.
 */
export function screen(input: ScreeningInput): ScreeningResult {
  const { district, size, m2 } = input;
  const season: SeasonKey = input.season ?? "year";
  const sleeps = input.sleeps && input.sleeps > 0 ? Math.round(input.sleeps) : null;
  // Mapování kapacity na pásmo NENÍ nová logika: je to `bandFor` z modelu,
  // tedy táž funkce, kterou model používá všude jinde (do 4 = 1BR, 5 až 8 =
  // 2BR, 9 a víc = 3BR). ObservedConfig nenese nic víc než pásmo.
  /**
   * Kapacita je NEVYŘEŠENÁ ve dvou případech:
   *  - zadaná kapacita 3 a míň: pásmo 1BR je nacenění až pro čtyři, pod tím
   *    model nevidí;
   *  - 1+kk bez zadané kapacity: model si dosadí čtyři, což u malého studia
   *    nemusí platit.
   * Zadané „spí 4“ u 1+kk vyřešené JE: to je vršek pásma, tam model sedí.
   */
  const capacityResolved = sleeps !== null ? sleeps >= 4 : size !== "1kk";
  const observedConfig: ObservedConfig | undefined = sleeps
    ? { band: bandFor(sleeps), evidence: `zadaná reálná kapacita: ${sleeps} hostů` }
    : undefined;
  const ctvrt = input.ctvrt && ctvrtiOf(district).some((c) => c.id === input.ctvrt) ? input.ctvrt : null;
  const base = BAND_BLEND[size].base; // jen pro popisek nepodporovaného výsledku
  const factor = operatorFactor(district, "internal");
  const measured = !!OPERATOR_EVIDENCE[district];
  const energy = ENERGY[size];

  const empty = (band: Band): ScreeningResult => ({
    supported: false, modelVersion: CALC_MODEL_VERSION, dataWindow: dataWindowLabel("cs"),
    publicMonthly: null, consLow: null, consHigh: null, screeningBaseline: null,
    ltrMonthly: null, energyMonthly: energy, floorMonthly: null,
    bufferCzk: null, bufferPct: null, deltaYear: null, ratioToRent: null,
    band, cellDerived: false, nMin: null, operatorFactorUsed: factor, operatorMeasured: measured,
    confidence: "low", verdict: "review", verdictReason: "thin_evidence",
    why: "Pro tuhle kombinaci nemáme dost tržních dat. Posoudit ručně, nedopočítávat.",
    capacitySource: "inferred", inferredBand: band, bandLabel: BAND_LABEL[band].cs,
    season, sleeps: input.sleeps ?? null, size, capacityResolved: false,
  });

  if (!isMeasured(district)) return empty(base);

  // Konzervativní cesta: pásmo na spodní hraně (config vypne překlopení podle
  // m²), interní operátorský faktor. Zbytek modelu je totožný s webem.
  const cons = ownerMonthly(district, size, {
    m2, ctvrt, season, scope: "internal", config: observedConfig,
  });
  if (!cons.supported) return empty(base);

  // Veřejné číslo jen pro srovnání a pro experiment E5.
  // Veřejná cesta beze změny: bez konfigurace, bez sezóny navíc.
  const pub = ownerMonthly(district, size, { m2, ctvrt, season, scope: "public" });
  // Co by vyšlo bez zadané kapacity, tedy o kolik s číslem pohnula.
  const inferredBand = ownerMonthly(district, size, { m2, ctvrt, season, scope: "internal" });

  // Vzorek: buňka okresu pro použité pásmo. Čtvrťové odvození nese `derived`
  // z ownerMonthly, tohle je signál o velikosti tržního vzorku okresu.
  const cell = marketCell(district as MeasuredLocation, cons.band);

  const screeningBaseline = cons.low;
  const ltr = rentFor(district, size, m2, "mix", ctvrt);
  const floor = ltr + energy;
  const bufferCzk = screeningBaseline - floor;
  const bufferPct = screeningBaseline / floor - 1;
  const nMin = cell?.nMin ?? null;
  // Nevyřešená kapacita je tentýž druh problému jako dopočtená buňka nebo malý
  // vzorek: chybí důkaz. Proto jde do stejné branky a nesmí dát zelenou.
  const thinEvidence = cons.derived || !isReliableN(nMin) || !capacityResolved;

  // „Vysoká" nesmí padnout tam, kde model kapacitu nerozlišuje, i kdyby tržní
  // data byla bezvadná. Tvrdit vysokou jistotu o nevyřešené věci je lež.
  const confidence: Confidence =
    cons.derived || (nMin !== null && nMin < 25) ? "low"
    : !thinEvidence && measured ? "high"
    : "medium";

  let verdict: Verdict;
  let verdictReason: VerdictReason = null;
  let why: string;
  if (bufferPct < REVIEW_MIN) {
    verdict = "not_worth";
    why = "Rozestup proti nájmu je na konzervativní cestě příliš těsný.";
  } else if (bufferPct >= WORTH_MIN && !thinEvidence) {
    verdict = "worth";
    why = "Silný rozestup proti nájmu, měřená buňka, dostatečný vzorek.";
  } else if (bufferPct >= WORTH_MIN) {
    verdict = "review";
    verdictReason = "thin_evidence";
    why = !capacityResolved
      ? "Ekonomika dobrá, ale model tady nerozlišuje kapacitu. Je to horní odhad, ne odhad."
      : cons.derived
        ? "Ekonomika dobrá, ale pásmo je dopočtené. Chybí důkaz, ne peníze."
        : "Ekonomika dobrá, ale malý tržní vzorek. Chybí důkaz, ne peníze.";
  } else {
    verdict = "review";
    verdictReason = "marginal_spread";
    why = "Důkaz v pořádku, ale rozestup je těsný. Do týdenní dávky, ne dnes.";
  }

  return {
    supported: true, modelVersion: CALC_MODEL_VERSION, dataWindow: dataWindowLabel("cs"),
    publicMonthly: pub.supported ? pub.mid : null,
    consLow: cons.low, consHigh: cons.high, screeningBaseline,
    ltrMonthly: ltr, energyMonthly: energy, floorMonthly: floor,
    bufferCzk: round(bufferCzk), bufferPct: Math.round(bufferPct * 1000) / 1000,
    deltaYear: round(bufferCzk * 12),
    ratioToRent: Math.round((screeningBaseline / ltr) * 100) / 100,
    band: cons.band, cellDerived: cons.derived, nMin,
    operatorFactorUsed: factor, operatorMeasured: measured,
    confidence, verdict, verdictReason, why,
    capacitySource: observedConfig ? "observed" : "inferred",
    inferredBand: inferredBand.supported ? inferredBand.band : cons.band,
    bandLabel: BAND_LABEL[cons.band].cs,
    season, sleeps, size, capacityResolved,
  };
}

/** Výchozí plocha, kterou obrazovka předvyplní po volbě okresu a dispozice. */
export const defaultArea = (district: string, size: SizeKey) => typicalArea(district, size);
export { RELIABLE_MIN_N };
