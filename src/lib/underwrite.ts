import { ownerMonthly, typicalArea, type LocationKey, type SizeKey } from "@/lib/yield";
import { annuity, leaseCap, LTV, RATE_DEFAULT, TERM_YEARS } from "@/lib/lease";

/**
 * INTERNÍ UNDERWRITING NÁJMU (5. 11. 2026). Jediná otázka: kolik nájmu byt
 * unese, a přijmeme číslo, které investor chce? Stejná data jako veřejná
 * kalkulačka (lib/lease.quoteLease), navíc:
 *  - srážky z prohlídky (přízemí, bez výtahu, dvůr, hluk, stav), které
 *    veřejný model nezná a které stojí 10 až 25 % tržby;
 *  - konzervativní tržba = trh × srážky × 0,9 (rezerva na špatný rok);
 *  - zimní test: nájem nesmí přesáhnout 90 % průměrného zimního NOI;
 *  - verdikt proti požadovanému nájmu. Nikdy „nějak to vyjde“.
 * Faktor Antam se ukazuje jen jako upside, do stropu nevstupuje.
 */
export type Haircut = { id: string; label: string; factor: number };
export const HAIRCUTS: Haircut[] = [
  { id: "ground", label: "Přízemí nebo suterén", factor: 0.88 },
  { id: "nolift", label: "3. patro a výš bez výtahu", factor: 0.9 },
  { id: "court", label: "Okna do dvora, tma", factor: 0.92 },
  { id: "noise", label: "Hluk (bar, tramvaj, stavba)", factor: 0.9 },
  { id: "state", label: "Stav: nutná rekonstrukce před spuštěním", factor: 0.95 },
  { id: "svj", label: "SVJ nebo dům proti krátkodobému ubytování", factor: 0.85 },
  { id: "small", label: "Malé pokoje, nejde dát druhé lůžko", factor: 0.93 },
];

/** Nad stropem, ale do 10 %: vyjednávat (protinabídka = strop). Víc: odmítnout. */
export const NEGOTIATE_BAND = 1.1;

export type UnderwriteInput = {
  loc: LocationKey; size: SizeKey; ctvrt: string | null; m2?: number;
  price: number; rate?: number;
  requestedRent: number | null;   // co investor chce (= jeho splátka), null = neví
  haircuts: string[];             // id z HAIRCUTS
};

export type UnderwriteResult = {
  supported: boolean;
  marketRevenue: number;        // trh, po provizi platforem, roční průměr
  antamRevenue: number;         // totéž × interní faktor Antam (jen upside)
  conservativeRevenue: number;  // trh × srážky × BAD_YEAR
  winterRevenue: number;        // zimní průměr trhu × srážky
  opex: number;                 // energie + provoz + práce
  noi: number;                  // konzervativní NOI
  winterNoi: number;
  capYear: number;              // 60 % konzervativního NOI
  capWinter: number;            // 90 % zimního NOI
  maxRent: number;              // min(capYear, capWinter), zaokrouhleno na stovky
  maxPrice: number;             // nejvyšší cena bytu pro plné krytí
  standardPayment: number;      // splátka 70 % / 30 let / sazba
  requestedRent: number | null;
  verdict: "accept" | "negotiate" | "reject" | "review";
  baseContribution: number | null;    // trh − opex − požadovaný nájem
  antamContribution: number | null;   // s faktorem − opex − požadovaný nájem (informativní)
  bearContribution: number | null;    // konzervativní − opex − požadovaný nájem
  winterCoverage: number | null;      // zimní NOI / požadovaný nájem
  reasons: string[];
  marginBase: number;           // trh − opex − maxRent
  marginAntam: number;          // s faktorem
  marginBear: number;           // konzervativní − opex − maxRent
};

export const underwrite = (i: UnderwriteInput): UnderwriteResult => {
  const m2 = i.m2 ?? typicalArea(i.loc, i.size);
  const year = ownerMonthly(i.loc, i.size, { season: "year", m2, ctvrt: i.ctvrt, scope: "internal" });
  const hc = i.haircuts.map((id) => HAIRCUTS.find((h) => h.id === id)?.factor ?? 1).reduce((a, b) => a * b, 1);
  const c = leaseCap(i.loc, i.size, { ctvrt: i.ctvrt, m2, haircut: hc, rate: i.rate });
  const standardPayment = Math.round(annuity(i.price * LTV, i.rate ?? RATE_DEFAULT, TERM_YEARS));
  const empty: UnderwriteResult = {
    supported: false, marketRevenue: 0, antamRevenue: 0, conservativeRevenue: 0, winterRevenue: 0, opex: 0, noi: 0, winterNoi: 0,
    capYear: 0, capWinter: 0, maxRent: 0, maxPrice: 0, standardPayment, requestedRent: i.requestedRent, verdict: "review",
    reasons: ["Pro tuhle čtvrť a dispozici nemáme spolehlivá tržní data."], marginBase: 0, marginAntam: 0, marginBear: 0,
    baseContribution: null, antamContribution: null, bearContribution: null, winterCoverage: null,
  };
  if (!c || !year.supported) return empty;
  const { marketRevenue, conservativeRevenue, winterRevenue, opex, noi, winterNoi, capYear, capWinter, maxRent, maxPrice } = c;
  const antamRevenue = year.antam.netRevenue;

  const reasons: string[] = [];
  let verdict: UnderwriteResult["verdict"] = "review";
  if (i.requestedRent === null) {
    reasons.push(`Bez požadavku investora. Náš strop je ${maxRent.toLocaleString("cs-CZ")} Kč.`);
  } else if (i.requestedRent <= maxRent) {
    verdict = "accept";
    reasons.push(`Požadavek ${i.requestedRent.toLocaleString("cs-CZ")} Kč je pod stropem ${maxRent.toLocaleString("cs-CZ")} Kč.`);
  } else if (i.requestedRent <= maxRent * NEGOTIATE_BAND) {
    verdict = "negotiate";
    reasons.push(`Požadavek ${i.requestedRent.toLocaleString("cs-CZ")} Kč je nad stropem o ${(i.requestedRent - maxRent).toLocaleString("cs-CZ")} Kč (do 10 %). Protinabídka: ${maxRent.toLocaleString("cs-CZ")} Kč, nebo nižší cena bytu do ${maxPrice.toLocaleString("cs-CZ")} Kč.`);
  } else {
    verdict = "reject";
    reasons.push(`Požadavek ${i.requestedRent.toLocaleString("cs-CZ")} Kč je nad stropem ${maxRent.toLocaleString("cs-CZ")} Kč o ${(i.requestedRent - maxRent).toLocaleString("cs-CZ")} Kč. Plné krytí u tohoto bytu do ceny ${maxPrice.toLocaleString("cs-CZ")} Kč.`);
  }
  if (capWinter < capYear) reasons.push("Strop určuje zima: zimní NOI je slabší než 60 % ročního.");
  if (hc < 1) reasons.push(`Srážky z prohlídky: tržba × ${hc.toFixed(2).replace(".", ",")}.`);
  if (i.requestedRent !== null && i.requestedRent > standardPayment * 1.02)
    reasons.push(`Požadavek je nad standardní splátkou (${standardPayment.toLocaleString("cs-CZ")} Kč): kratší splatnost nebo vyšší LTV. Rozdíl doplácí investor.`);
  if (marketRevenue > 0 && maxRent / marketRevenue > 0.5) reasons.push("Nájem nad 50 % tržby trhu: hraniční i při přijetí.");

  return {
    supported: true, marketRevenue, antamRevenue, conservativeRevenue, winterRevenue, opex, noi, winterNoi,
    capYear, capWinter, maxRent, maxPrice, standardPayment, requestedRent: i.requestedRent, verdict, reasons,
    marginBase: marketRevenue - opex - maxRent,
    marginAntam: antamRevenue - opex - maxRent,
    marginBear: conservativeRevenue - opex - maxRent,
    baseContribution: i.requestedRent === null ? null : marketRevenue - opex - i.requestedRent,
    antamContribution: i.requestedRent === null ? null : antamRevenue - opex - i.requestedRent,
    bearContribution: i.requestedRent === null ? null : conservativeRevenue - opex - i.requestedRent,
    winterCoverage: i.requestedRent ? winterNoi / i.requestedRent : null,
  };
};
