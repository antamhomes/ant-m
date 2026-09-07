// Sezónní násobky (SEASONS_BY_LOC) z artefaktu okresu — REPRODUKOVATELNÝ
// recept, zapsaný 7. 9. 2026 před integrací Prahy 10 (předregistrace
// Vršovic, bod „Integrační dávka"). Do té doby existoval jen jako
// doc-comment v yield.ts; tenhle skript ho vrací jako kód a ověřuje, že
// pro P1–P9 dává PŘESNĚ dnešní konstanty (--check).
//
// Recept (jediný, který sedí na všech 54 konstantách P1–P9, ověřeno proti
// třem alternativám — průměr pásmových faktorů vážený nMean a nevážený
// měsíční průměr NESEDÍ):
//   1. spolehlivá pásma = ta, která má okres v MARKET_STR (nMin ≥ 50)
//   2. pro každý měsíc: ADR_m = Σ_b n_bm·adr_bm / Σ_b n_bm (totéž RevPAR),
//      tj. měsíční hodnota vážená počtem aktivních nabídek přes pásma
//   3. léto = duben–říjen (7 měs.), zima = listopad–březen bez prosince
//      (4 měs.), Vánoce = prosinec; faktor = průměr sezóny / průměr 12 měs.
//   4. zaokrouhlení na 3 desetinná místa
// Z definice platí (7·léto + 4·zima + Vánoce)/12 = 1 (facts.test.ts).
//
//   node scripts/pl-seasons.mjs --artifact data/pricelabs-2026-09/praha10.json --bands 1BR,2BR
//   node scripts/pl-seasons.mjs --check      # reprodukce P1–P9 proti yield.ts
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(`--${k}`); return i === -1 ? null : args[i + 1]; };
const has = (k) => args.includes(`--${k}`);

const SEASON_OF = (month) => {
  const m = Number(month.split("_")[1]);
  if (m === 12) return "xmas";
  if (m >= 4 && m <= 10) return "summer";
  return "winter";
};
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const r3 = (x) => Math.round(x * 1000) / 1000;

export function seasonFactors(artifact, bands) {
  const months = artifact.meta.months;
  if (!Array.isArray(months) || months.length !== 12) throw new Error("artefakt nema 12 mesicu");
  for (const b of bands) {
    if (!artifact[b]) throw new Error(`pasmo ${b} v artefaktu neni`);
    for (const f of ["adr", "revpar", "active_listings"])
      if (!Array.isArray(artifact[b][f]) || artifact[b][f].length !== 12) throw new Error(`${b}.${f} nema 12 hodnot`);
  }
  const pooled = (key) => months.map((_, i) => {
    const n = bands.reduce((s, b) => s + artifact[b].active_listings[i], 0);
    return bands.reduce((s, b) => s + artifact[b][key][i] * artifact[b].active_listings[i], 0) / n;
  });
  const out = {};
  for (const key of ["adr", "revpar"]) {
    const series = pooled(key);
    const annual = mean(series);
    for (const s of ["summer", "winter", "xmas"]) {
      const idx = months.map((m, i) => (SEASON_OF(m) === s ? i : -1)).filter((i) => i >= 0);
      out[s] = out[s] || {};
      out[s][key] = r3(mean(idx.map((i) => series[i])) / annual);
    }
  }
  const counts = { summer: 0, winter: 0, xmas: 0 };
  for (const m of months) counts[SEASON_OF(m)]++;
  if (counts.summer !== 7 || counts.winter !== 4 || counts.xmas !== 1) throw new Error(`sezony ${JSON.stringify(counts)} nejsou 7/4/1`);
  return out;
}

const CHECK = {
  // spolehlivá pásma = MARKET_STR v yield.ts k 7. 9. 2026
  praha1: ["1BR", "2BR", "3BR"], praha2: ["1BR", "2BR", "3BR"], praha3: ["1BR", "2BR"], praha4: ["1BR", "2BR"],
  praha5: ["1BR", "2BR", "3BR"], praha6: ["1BR", "2BR"], praha7: ["1BR", "2BR"], praha8: ["1BR", "2BR"], praha9: ["1BR"],
};

if (has("check")) {
  const src = readFileSync("src/lib/yield.ts", "utf8");
  let bad = 0;
  for (const [loc, bands] of Object.entries(CHECK)) {
    const art = JSON.parse(readFileSync(`data/pricelabs-2026-08/${loc}.json`, "utf8"));
    const f = seasonFactors(art, bands);
    const line = src.split("\n").find((l) => l.trim().startsWith(`${loc}: { summer:`));
    if (!line) { console.log(`?? ${loc}: radek v SEASONS_BY_LOC nenalezen`); bad++; continue; }
    const want = line.replace(/^\s*\w+: /, "").replace(/,\s*$/, "");
    const got = `{ summer: { adr: ${f.summer.adr.toFixed(3)}, revpar: ${f.summer.revpar.toFixed(3)} }, winter: { adr: ${f.winter.adr.toFixed(3)}, revpar: ${f.winter.revpar.toFixed(3)} }, xmas: { adr: ${f.xmas.adr.toFixed(3)}, revpar: ${f.xmas.revpar.toFixed(3)} } }`;
    const ok = want === got;
    if (!ok) bad++;
    console.log(`${ok ? "OK " : "!! "} ${loc} [${bands.join(",")}]  ${got}${ok ? "" : `\n     yield.ts: ${want}`}`);
  }
  console.log(bad ? `\n${bad} okresu NESEDI` : "\nvsech 9 okresu reprodukovano presne (54 konstant)");
  process.exit(bad ? 1 : 0);
}

const path = arg("artifact");
const bands = (arg("bands") || "").split(",").map((s) => s.trim()).filter(Boolean);
if (!path || !bands.length) { console.error("pouziti: --artifact <json> --bands 1BR,2BR | --check"); process.exit(2); }
const art = JSON.parse(readFileSync(path, "utf8"));
const f = seasonFactors(art, bands);
console.log(`artefakt ${path}  pasma ${bands.join(",")}  okno ${art.meta.months[0]}..${art.meta.months[11]}`);
console.log(`{ summer: { adr: ${f.summer.adr.toFixed(3)}, revpar: ${f.summer.revpar.toFixed(3)} }, winter: { adr: ${f.winter.adr.toFixed(3)}, revpar: ${f.winter.revpar.toFixed(3)} }, xmas: { adr: ${f.xmas.adr.toFixed(3)}, revpar: ${f.xmas.revpar.toFixed(3)} } }`);
for (const k of ["adr", "revpar"]) console.log(`  kontrola (7·leto+4·zima+vanoce)/12 ${k}: ${((7 * f.summer[k] + 4 * f.winter[k] + f.xmas[k]) / 12).toFixed(4)}`);
