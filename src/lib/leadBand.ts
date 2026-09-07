import type { SizeKey } from "@/lib/yield";
import { CALC_DATA_WINDOW, dataWindowLabel } from "@/lib/dataWindow";

/**
 * KVALIFIKACE POPTÁVKY (pásmo), jen prezentace a interní skórování.
 *
 * Není to ekonomika modelu: pásmo se počítá až nad dvěma čísly, která
 * kalkulačka stejně ukazuje (owner_high, nájem), nic v yield.ts nemění a
 * číslo na kartě nikdy neovlivní. Návštěvník písmeno nikdy nevidí; jde do
 * poptávky (e-mail + portál) a do analytiky, aby se silný byt v Praze 1
 * nečetl v inboxu stejně jako 1,2× byt v Praze 4.
 *
 * Prahy jsou PROVIZORNÍ (docs/funnel-spec-2026-09-07.md §3): přirozené zlomy
 * rozdělení 312 veřejných kombinací + kotvy majitele (1,1× studené, 1,7 až 2×
 * horké). Po 60 dnech dat se přenastaví podle skutečné úspěšnosti po pásmech.
 *
 * Výjimka 1kk·l: největší kbelík 1+kk padá pod 1,3× i v silných čtvrtích,
 * protože nájem roste s plochou, kdežto pásmo trhu zůstává 1BR. To je známé
 * omezení kapacity 1+kk (docs/calculator-model.md), ne signál o bytě, takže
 * se takový byt nikdy neoznačí jako slabý.
 */
export type LeadBand = "strong" | "viable" | "weak" | "unsupported" | "oversized" | "none";

export const BAND_RULE = {
  /** ratio owner_high / nájem, od kterého je byt silný */
  strongMin: 1.7,
  /** ratio, od kterého je byt nadějný */
  viableMin: 1.3,
  /** roční rozdíl v Kč, který drží byt v nadějných i pod viableMin */
  viableDeltaYearMin: 100_000,
} as const;

export type BandInput = {
  supported: boolean;
  oversized: boolean;
  ownerHigh: number | null;
  ltrMonth: number | null;
  size: SizeKey;
  bucket: string;
};

export type BandResult = {
  band: LeadBand;
  /** owner_high / nájem, null bez nájmu */
  ratio: number | null;
  /** (owner_high − nájem) × 12, null bez nájmu */
  annualDelta: number | null;
};

export const classifyBand = (i: BandInput): BandResult => {
  if (i.oversized) return { band: "oversized", ratio: null, annualDelta: null };
  if (!i.supported || i.ownerHigh === null) return { band: "unsupported", ratio: null, annualDelta: null };
  if (i.ltrMonth === null || i.ltrMonth <= 0) return { band: "none", ratio: null, annualDelta: null };
  const ratio = i.ownerHigh / i.ltrMonth;
  const annualDelta = (i.ownerHigh - i.ltrMonth) * 12;
  if (ratio >= BAND_RULE.strongMin) return { band: "strong", ratio, annualDelta };
  const capacityOverride = i.size === "1kk" && i.bucket === "l";
  if (ratio >= BAND_RULE.viableMin || annualDelta >= BAND_RULE.viableDeltaYearMin || capacityOverride)
    return { band: "viable", ratio, annualDelta };
  return { band: "weak", ratio, annualDelta };
};

/**
 * Co kalkulačka posílá poptávce (event antam:prefill-contact / antam:calc-state).
 * Čitelné popisky jdou vedle surových id, aby formulář ani e-mail nemusely
 * nic dohledávat: „praha1 · stare_mesto“ v poptávce byl do 7. 9. 2026 bug.
 */
export type LeadCalcPayload = {
  model_version: string;
  data_window: { from: string; to: string; months: number };
  district: string;
  district_label: string;
  ctvrt: string | null;
  ctvrt_label: string | null;
  dispozice: SizeKey;
  size_label: string;
  size_bucket_id: string;
  bucket_label: string;
  representative_m2: number | null;
  oversized: boolean;
  season: string;
  owner_low: number | null;
  owner_high: number | null;
  ltr_month: number | null;
  ltr_ctvrt_factor: number;
  derived: boolean;
  result_band: LeadBand;
  ratio: number | null;
  annual_delta: number | null;
};

// E-mail: obyčejné mezery (není to web). Formulář: nezlomitelné, ať se „63 000 Kč“ nerozpadne.
const plain = (n: number) => n.toLocaleString("cs-CZ").replace(/\s/g, " ");
const czk = (n: number) => `${plain(Math.round(n))} Kč`;
const czkK = (n: number) => `${plain(Math.round(n / 1000) * 1000)} Kč`;
const nb = (text: string) => text.replace(/ /g, "\u00a0");

/**
 * Popis bytu z kalkulačky, jak ho vidí majitel ve formuláři („Z kalkulačky:“):
 * Praha 1 · Staré Město · 2+kk · kolem 63 m² · ~63 000 Kč / měsíc.
 * Bez pásma, bez násobku; jen to, co viděl na kartě.
 */
export const calcEchoLabel = (p: Partial<LeadCalcPayload>, lang: "cs" | "vi"): string => {
  const parts: string[] = [];
  if (p.district_label) parts.push(p.district_label);
  if (p.ctvrt_label) parts.push(p.ctvrt_label);
  if (p.size_label) parts.push(p.size_label);
  if (typeof p.representative_m2 === "number")
    parts.push(lang === "cs" ? `kolem ${p.representative_m2}\u00a0m²` : `khoảng ${p.representative_m2}\u00a0m²`);
  else if (p.bucket_label) parts.push(p.bucket_label);
  if (typeof p.owner_high === "number")
    parts.push(`~${nb(czkK(p.owner_high))}${lang === "cs" ? " / měsíc" : " / tháng"}`);
  return parts.join(" · ");
};

/**
 * Jeden řádek do e-mailu s poptávkou (interní, vždy česky): čitelná lokalita,
 * číslo z karty, nájem, násobek, roční rozdíl, pásmo, derived, verze a okno dat.
 * Šablona e-mailu má pevná pole, takže tenhle řádek jde na začátek zprávy.
 */
export const leadSummaryLine = (p: Partial<LeadCalcPayload>): string => {
  const parts: string[] = [];
  const where = [p.district_label ?? p.district, p.ctvrt_label ?? undefined].filter(Boolean).join(" · ");
  if (where) parts.push(where);
  if (p.size_label) parts.push(p.size_label);
  if (typeof p.representative_m2 === "number") parts.push(`kolem ${p.representative_m2} m²`);
  else if (p.bucket_label) parts.push(p.bucket_label);
  if (p.season && p.season !== "year") parts.push(`sezóna ${p.season}`);
  if (typeof p.owner_high === "number") parts.push(`~${czkK(p.owner_high)}/měs (rozpětí ${p.owner_low != null ? czk(p.owner_low) : "?"} až ${czk(p.owner_high)})`);
  if (typeof p.ltr_month === "number" && p.ltr_month > 0) parts.push(`nájem ${czk(p.ltr_month)}`);
  if (typeof p.ratio === "number") parts.push(`${p.ratio.toFixed(2).replace(".", ",")}× nájem`);
  if (typeof p.annual_delta === "number") parts.push(`${p.annual_delta >= 0 ? "+" : "−"}${czk(Math.abs(p.annual_delta))}/rok`);
  parts.push(`pásmo: ${p.result_band ?? "none"}`);
  if (p.derived) parts.push("odvozené číslo");
  if (p.model_version) parts.push(`model ${p.model_version}`);
  parts.push(`data ${dataWindowLabel("cs", p.data_window ?? CALC_DATA_WINDOW)}`);
  return `Kalkulačka: ${parts.join(" · ")}`;
};
