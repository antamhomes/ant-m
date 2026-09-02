// Odvozeni pasem z PriceLabs artefaktu. Ciste, bez IO a bez databaze, aby se
// dalo testovat v vitestu (src/test/import.test.ts) proti temuz artefaktu,
// ze ktereho jsou konstanty v src/lib/yield.ts.
export const MONTHS_EXPECTED = 12;
export const RELIABLE_MIN_N = 50;   // HEURISTIC, viz docs/calculator-model.md
// 4BR je v seznamu, aby ho pull NEZAHODIL jako neznáme pásmo. Model ho zatím
// nezná (`Band` je 1BR|2BR|3BR a `BAND_BLEND["4kk"]` končí na 3BR), takže
// dokud se pásmo nezavede, projde 4BR pipeline a čeká v artefaktu.
export const BANDS = ["1BR", "2BR", "3BR", "4BR", "all"];

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const mean = (xs) => xs.reduce((a, c) => a + c, 0) / xs.length;

/** @returns {{usable: object[], rejected: {band:string,why:string[]}[], unknown: string[], rawKeys: string[]}} */
export function deriveBands(doc) {
  const rawKeys = Object.keys(doc).filter((k) => k !== "meta");
  const unique = [...new Set(rawKeys)].filter((k) => BANDS.includes(k));
  const unknown = [...new Set(rawKeys)].filter((k) => !BANDS.includes(k));
  const usable = [], rejected = [];

  for (const band of unique) {
    const b = doc[band] || {};
    const listings = (b.active_listings || []).map(num);
    const revenue = (b.avg_revenue || []).map(num);
    const adr = (b.adr || []).map(num);
    const revpar = (b.revpar || []).map(num);
    const occ = (b.occ || []).map(num);
    const why = [];
    if (listings.length !== MONTHS_EXPECTED) why.push(`active_listings ma ${listings.length} mesicu, ceka se ${MONTHS_EXPECTED}`);
    if (listings.some((v) => v === null)) why.push("active_listings ma diru");
    if (revenue.length !== MONTHS_EXPECTED || revenue.some((v) => v === null)) why.push("avg_revenue neuplne (annual_rev by byl podstreleny)");
    if (adr.some((v) => v === null) || revpar.some((v) => v === null)) why.push("adr/revpar ma diru");
    if (why.length) { rejected.push({ band, why }); continue; }

    usable.push({
      band,
      nMin: Math.min(...listings),
      nMean: Math.round(mean(listings)),        // pulka nahoru, sjednoceno s repem
      annualRev: Math.round(revenue.reduce((a, c) => a + c, 0)),
      annualAdr: Math.round(mean(adr)),
      annualRevpar: Math.round(mean(revpar)),
      // occ na JEDNO desetinne misto: tak ho ulozila puvodni importni cesta.
      // Zmena presnosti by prepsala historii u vsech radku - to je vedome
      // rozhodnuti, ne vedlejsi efekt Step 0.
      annualOcc: occ.length === MONTHS_EXPECTED && !occ.some((v) => v === null)
        ? Math.round(mean(occ) * 10) / 10 : null,
      reliable: Math.min(...listings) >= RELIABLE_MIN_N,
      monthly: Object.fromEntries(Object.entries(b).filter(([, v]) => Array.isArray(v))),
    });
  }
  return { usable, rejected, unknown, rawKeys, unique };
}
