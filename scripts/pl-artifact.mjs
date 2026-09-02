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
import { pullWindow, WINDOW_MONTHS, artifactDir } from "./pl-window.mjs";
import { reconcile, canonical, sha256 as hashOf } from "./pl-raw.mjs";

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf("--" + n); return i === -1 ? d : argv[i + 1]; };
const args = (n) => argv.reduce((a, v, i) => (v === "--" + n && argv[i + 1] ? [...a, argv[i + 1]] : a), []);
const fail = (m) => { console.error("STOP: " + m); process.exit(1); };

const inPath = arg("in"), slug = arg("slug"), geometry = arg("geometry");
if (!inPath || !slug || !geometry) fail("chybi --in / --slug / --geometry");
if (!existsSync(inPath)) fail(`vstup neexistuje: ${inPath}`);

const bands = (arg("bands") || "1BR,2BR,3BR").split(",").map((s) => s.trim()).filter(Boolean);

// PROVENIENCE PÁSMA. "measured" = pullnuto přímo pro tuhle geometrii.
// "derived_split" = rozpad jednoho součtu poměrem — analýza, do produkce ne.
const basis = arg("basis", "measured");
if (!["measured", "derived_split"].includes(basis)) fail(`--basis musi byt measured|derived_split, ne ${basis}`);
const basisFrom = arg("basis-from"), basisReason = arg("basis-reason");
if (basis === "derived_split" && (!basisFrom || !basisReason))
  fail("derived_split musi rict --basis-from a --basis-reason. Rozpad bez doloziteho puvodu je jen cislo.");
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

// 4. SYROVÁ PROVENIENCE. Bez ní se "measured" nedá odlišit od zkopírovaného
// souboru: fixtures v _to_delete/gate-test/ prošly body 1-3 bez zaváhání.
// Každé měřené pásmo musí ukázat na envelope z pl-raw.mjs a KAŽDÉ číslo
// v artefaktu musí jít odvodit z toho, co PriceLabs vrátil.
const rawArgs = args("raw");            // --raw 2BR=data/pricelabs-raw/nove_mesto.2BR.raw.json
const rawMap = Object.fromEntries(rawArgs.map((s) => {
  const i = s.indexOf("=");
  if (i === -1) fail(`--raw ceka BAND=cesta, dostal jsem "${s}"`);
  return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
}));
const rawProvenance = {};
if (basis === "measured") {
  for (const b of bands) {
    const rp = rawMap[b];
    if (!rp)
      fail(`pasmo ${b} nema --raw. Measured bez syrove odpovedi je jen tvrzeni.\n`
         + `  Zachyt ji pres pl-raw.mjs uz pri pullu; zpetne se doplnit neda.`);
    if (!existsSync(rp)) fail(`syrova odpoved neexistuje: ${rp}`);
    let env;
    try { env = JSON.parse(readFileSync(rp, "utf8")); }
    catch (e) { fail(`${rp} neni platny JSON: ${e.message}`); }

    if (env?.request?.band !== b)
      fail(`${rp} je pro pasmo "${env?.request?.band}", pripojuje se k "${b}"`);
    if (env?.response?.geometry !== geometry)
      fail(`geometrie NESEDI znak po znaku.\n  artefakt:  "${geometry}"\n  odpoved:   "${env?.response?.geometry}"`);

    const why = reconcile(env, raw[b], win.months);
    if (why.length)
      fail(`pasmo ${b} NEODPOVIDA syrove odpovedi:\n` + why.slice(0, 8).map((w) => "  - " + w).join("\n")
         + (why.length > 8 ? `\n  ... a dalsich ${why.length - 8}` : ""));

    rawProvenance[b] = {
      file: rp,
      raw_sha256: hashOf(canonical(env)),
      captured_at: env.captured_at ?? null,
      question_sha256: env?.request?.question_sha256 ?? null,
      geometry_label: env?.response?.selected_geometry_label ?? null,
      geometry_source: env?.response?.selected_geometry_source ?? null,
      session_id: env?.request?.session_id ?? null,
      geometry_token: env?.request?.geometry_token ?? null,
    };
  }
} else if (rawArgs.length) {
  fail("--raw se pouziva jen s --basis measured; rozpad zadnou vlastni odpoved nema");
}

// Adresář podle DATA PULLU (konvence repa), ne podle konce okna.
const pulledAt = new Date().toISOString().slice(0, 10);
const out = arg("out") || `${artifactDir(pulledAt)}/${slug}.json`;
mkdirSync(path.dirname(out), { recursive: true });
const doc = {
  meta: {
    pulled: pulledAt,
    source: "PriceLabs MCP market_research",
    geometry,
    slug,
    currency: "CZK (converted from USD, month-aligned rates)",
    months: win.months,
    window_rule: `poslednich ${WINDOW_MONTHS} uzavrenych mesicu (pl-window.mjs)`,
    bands,
    // per-band provenience; importer bez ni odmitne produkcni import
    bands_basis: Object.fromEntries(bands.map((b) => [b,
      basis === "measured" ? { basis } : { basis, from: basisFrom, reason: basisReason }])),
    fields_note: "occ %, adr a revpar Kc/noc, avg_revenue Kc na aktivni listing a kalendarni mesic",
    // ODKAZ NA SYROVOU ODPOVED. Importer overuje, ze soubor existuje, ze jeho
    // haš sedí a ze se z nej artefakt porad reprodukuje.
    raw_provenance: basis === "measured" ? rawProvenance : null,
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
console.log(`    basis  ${basis}${basis === "measured" ? "" : `  (z ${basisFrom}: ${basisReason})`}`);
if (basis !== "measured")
  console.log("    !! derived_split je ANALYZA. Do produkcniho importu neprojde.");
console.log(`    sha256 ${sha}`);
for (const b of bands) if (rawProvenance[b])
  console.log(`    raw ${b.padEnd(4)} ${rawProvenance[b].raw_sha256.slice(0, 16)}…  ${rawProvenance[b].file}`);
console.log(`    okno   ${win.from} .. ${win.to}`);
for (const b of bands) {
  const l = doc[b].active_listings;
  console.log(`    ${b.padEnd(4)} nMin ${String(Math.min(...l)).padStart(5)}  nMean ${String(Math.round(l.reduce((a, c) => a + c, 0) / l.length)).padStart(5)}`);
}
console.log(`\nDalsi krok: scripts/pl-import.mjs --artifact ${out} --geo <okres>_${slug} --level ctvrt --source-geometry ${slug} --slug ${slug} --bands ${bands.join(",")} --requests <skutecna spotreba>`);
