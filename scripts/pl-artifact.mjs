#!/usr/bin/env node
// Uzavře čtvrťový pull do artefaktu. VALIDÁTOR, ne formátovač: co neprojde,
// se nezapíše, protože v modelu se špatná buňka pozná až po měsících.
//
// Chytá přesně ty tři chyby, které se už staly:
//   1) měsíční řada se neuložila  -> Staré Město je proto RECONSTRUCTED a nejde
//      z něj spočítat nMin ani ověřit adr
//   2) jiné okno než zbytek repa  -> indexy neporovnatelné
//   3) chybějící pásmo tiše projde jako "hotovo" -> pull_state by lhal
//
//   node scripts/pl-artifact.mjs --in /tmp/nove_mesto.raw.json \
//     --slug nove_mesto --geometry "New Town official boundary (openstreetmap)" \
//     --bands 1BR,2BR,3BR [--out data/pricelabs-2026-09/nove_mesto.json]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pullWindow, WINDOW_MONTHS } from "./pl-window.mjs";

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf("--" + n); return i === -1 ? d : argv[i + 1]; };
const fail = (m) => { console.error("STOP: " + m); process.exit(1); };

const inPath = arg("in"), slug = arg("slug"), geometry = arg("geometry");
if (!inPath || !slug || !geometry) fail("chybi --in / --slug / --geometry");
if (!existsSync(inPath)) fail(`vstup neexistuje: ${inPath}`);

const bands = (arg("bands") || "1BR,2BR,3BR").split(",").map((s) => s.trim()).filter(Boolean);
const win = pullWindow(arg("today") ? new Date(arg("today")) : new Date());
const raw = JSON.parse(readFileSync(inPath, "utf8"));

// 1. všechna požadovaná pásma
const missing = bands.filter((b) => !raw[b]);
if (missing.length) fail(`chybi pasma ${missing.join(", ")} — pull je NEUPLNY, pull_state zustava partial a artefakt se nezapisuje`);

// 2. každé pásmo úplné a stejně dlouhé
const NEEDED = ["occ", "adr", "revpar", "active_listings", "avg_revenue"];
for (const b of bands) {
  for (const f of NEEDED) {
    const a = raw[b][f];
    if (!Array.isArray(a)) fail(`${b}.${f} chybi nebo neni pole — bez cele rady nejde prepocitat nMean ani nMin`);
    if (a.length !== WINDOW_MONTHS) fail(`${b}.${f} ma ${a.length} mesicu, ceka se ${WINDOW_MONTHS}`);
    const hole = a.findIndex((v) => typeof v !== "number" || !Number.isFinite(v));
    if (hole !== -1) fail(`${b}.${f} ma diru na pozici ${hole} (${win.months[hole]})`);
  }
}

// 3. okno musí sedět na deterministické pravidlo
const declared = raw.meta?.months;
if (Array.isArray(declared)) {
  const norm = declared.map((s) => String(s).replace("-", "_"));
  if (norm.join(",") !== win.months.join(","))
    fail(`okno nesedi.\n  artefakt: ${norm[0]}..${norm[norm.length - 1]}\n  pravidlo: ${win.from}..${win.to}\n  Dve ruzna okna = indexy mezi ctvrtemi neporovnatelne.`);
}

const out = arg("out") || `data/pricelabs-${win.to.replace("_", "-")}/${slug}.json`;
mkdirSync(path.dirname(out), { recursive: true });
const doc = {
  meta: {
    pulled: new Date().toISOString().slice(0, 10),
    source: "PriceLabs MCP market_research",
    geometry,
    slug,
    currency: "CZK (converted from USD, month-aligned rates)",
    months: win.months,
    window_rule: `poslednich ${WINDOW_MONTHS} uzavrenych mesicu (pl-window.mjs)`,
    bands,
    fields_note: "occ %, adr a revpar Kc/noc, avg_revenue Kc na aktivni listing a kalendarni mesic",
  },
};
for (const b of bands) doc[b] = raw[b];
const json = JSON.stringify(doc, null, 1);
writeFileSync(out, json);
const sha = createHash("sha256").update(json).digest("hex");
writeFileSync(out.replace(/\.json$/, ".meta.json"), JSON.stringify({
  artifact: out, sha256: sha, bytes: Buffer.byteLength(json),
  window: { from: win.from, to: win.to }, slug, geometry, bands,
  pulled: doc.meta.pulled,
}, null, 1) + "\n");

console.log(`OK  ${out}`);
console.log(`    sha256 ${sha}`);
console.log(`    okno   ${win.from} .. ${win.to}`);
for (const b of bands) {
  const l = doc[b].active_listings;
  console.log(`    ${b.padEnd(4)} nMin ${String(Math.min(...l)).padStart(5)}  nMean ${String(Math.round(l.reduce((a, c) => a + c, 0) / l.length)).padStart(5)}`);
}
console.log(`\nDalsi krok: scripts/pl-import.mjs --artifact ${out} --geo <okres>_${slug} --level ctvrt --source-geometry ${slug} --slug ${slug} --bands ${bands.join(",")} --requests <skutecna spotreba>`);
