// Okno pullu. DETERMINISTICKÉ pravidlo, ne úsudek.
//
// Proč vůbec: 10 čtvrtí pullnutých 1. 9. 2026 jelo na 2025_09..2026_07, kdežto
// devět okresů v repu jede na 2025_08..2026_07. Dvě různá okna = indexy mezi
// sebou neporovnatelné, a přitom to na první pohled není vidět. Druhý důvod:
// poslední měsíc bývá nedojetý (rezervace ještě dobíhají) a "vypadá slabě proti
// loňsku" je úsudek, který se pokaždé rozhodne jinak.
//
// Pravidlo: posledních 12 CELÝCH kalendářních měsíců, přičemž měsíc se počítá
// za uzavřený teprve CLOSE_LAG_DAYS dní po svém konci. Žádné koukání do dat.
export const CLOSE_LAG_DAYS = 10;
export const WINDOW_MONTHS = 12;

const fmt = (y, m) => `${y}_${String(m + 1).padStart(2, "0")}`;

/** @param {Date} today @returns {{from:string,to:string,months:string[]}} */
export function pullWindow(today = new Date(), lagDays = CLOSE_LAG_DAYS) {
  const y = today.getUTCFullYear(), m = today.getUTCMonth(), d = today.getUTCDate();
  // minulý měsíc; a když ještě neuplynulo lagDays od jeho konce, o další zpátky
  let endY = y, endM = m - 1;
  if (d < lagDays) endM -= 1;
  while (endM < 0) { endM += 12; endY -= 1; }
  const months = [];
  for (let i = WINDOW_MONTHS - 1; i >= 0; i--) {
    let mm = endM - i, yy = endY;
    while (mm < 0) { mm += 12; yy -= 1; }
    months.push(fmt(yy, mm));
  }
  return { from: months[0], to: months[months.length - 1], months };
}

/**
 * Adresář artefaktu. Řídí se DATEM PULLU, ne koncem okna.
 *
 * Repo tak ukládá od začátku: `data/pricelabs-2026-08/` drží pull z 30. 8.
 * 2026, jehož okno končí `2026_07`. Default `pl-artifact.mjs` se dřív bral
 * z konce okna, takže by zářijový pull mlčky spadl do `pricelabs-2026-07`
 * a mísil se s jiným pullem. Nachytáno 2. 9. 2026 při Novém Městě, kde to
 * zachránil ruční `--out` — což je přesně ta záchrana, na kterou se nedá
 * spoléhat. Default musí sedět sám.
 *
 * @param {string} pulled datum pullu ve tvaru YYYY-MM-DD
 */
export function artifactDir(pulled) {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(pulled));
  if (!m) throw new Error(`artifactDir: ceka YYYY-MM-DD, dostal "${pulled}"`);
  return `data/pricelabs-${m[1]}-${m[2]}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const w = pullWindow(process.argv[2] ? new Date(process.argv[2]) : new Date());
  console.log(`${w.from} .. ${w.to}  (${w.months.length} mesicu)`);
}
