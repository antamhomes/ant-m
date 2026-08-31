#!/usr/bin/env node
// Step 0 importni cesta pro PriceLabs artefakty.
//
// Ciste odvozeni: artefakt na disku -> report + SQL. Skript se NEPRIPOJUJE
// k databazi. Integritu vynucuje schema (prirozeny klic, trigger proti tichemu
// prepisu historie, reliable z n_min, povinna mesicni rada), takze zapis nejde
// zkazit ani tim, ze nekdo tenhle skript obejde.
//
//   node scripts/pl-import.mjs --artifact data/pricelabs-2026-08/praha3.json \
//     --geo praha3 --level okres --source-geometry praha3 --slug praha3 \
//     --bands 1BR,2BR,3BR [--requests 3] [--emit-sql]

import { readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { deriveBands, RELIABLE_MIN_N, MONTHS_EXPECTED, BANDS } from "./pl-derive.mjs";

const IMPORT_VERSION = "step0.1";

const argv = process.argv.slice(2);
const arg = (n, d = null) => {
  const i = argv.indexOf("--" + n);
  return i === -1 ? d : (argv[i + 1] ?? "").startsWith("--") ? true : argv[i + 1];
};
const flag = (n) => argv.includes("--" + n);

const fail = (msg) => { console.error("STOP: " + msg); process.exit(1); };
const warn = (msg) => console.log("WARN  " + msg);

// ---------------------------------------------------------------- artefakt
const artifact = arg("artifact");
if (!artifact) fail("chybi --artifact");
if (!existsSync(artifact)) fail(`artefakt neexistuje: ${artifact}`);

const rel = path.relative(process.cwd(), path.resolve(artifact));
if (rel.startsWith("..") || !rel.startsWith("data" + path.sep))
  fail(`artefakt musi lezet pod data/ (dostal jsem ${rel}). Surovy artefakt se uklada PRED odvozenym zapisem.`);

// "raw saved before derived writes": artefakt musi byt uz ve verzovani.
if (!flag("allow-uncommitted")) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", rel], { stdio: "ignore" });
  } catch {
    fail(`artefakt ${rel} neni v gitu. Nejdriv commitni surovy artefakt, teprve pak odvozuj. (--allow-uncommitted jen pro dry-run zkousku)`);
  }
}

const rawBytes = readFileSync(artifact);
const sha256 = createHash("sha256").update(rawBytes).digest("hex");
let doc;
try { doc = JSON.parse(rawBytes.toString("utf8")); }
catch (e) { fail(`artefakt neni platny JSON: ${e.message}`); }

// ---------------------------------------------------------------- identita
const geoId = arg("geo");
const geoLevel = arg("level");
const sourceGeometry = arg("source-geometry");
const slug = arg("slug") || geoId;
const source = arg("source", "pricelabs");
if (!geoId || !geoLevel || !sourceGeometry) fail("chybi --geo / --level / --source-geometry");
if (!["ctvrt", "okres", "praha"].includes(geoLevel)) fail(`--level musi byt ctvrt|okres|praha, ne ${geoLevel}`);

// Model kontexty se overuji proti registru GEO v src/lib/yield.ts.
// geo_id v databazi je praha3_zizkov, v registru praha3/zizkov - jedna identita,
// dva zapisy. Geometrie je sdilena, kontext ne.
const yieldSrc = readFileSync("src/lib/yield.ts", "utf8");
const geoBlock = yieldSrc.match(/export const GEO: GeoContext\[\] = \[([\s\S]*?)\n\];/);
if (!geoBlock) fail("v src/lib/yield.ts se nenasel registr GEO");
const contexts = [...geoBlock[1].matchAll(/id: "([^"]+)"[^}]*?sourceGeometry: "([^"]+)"/g)]
  .map(([, id, sg]) => ({ id, dbId: id.replace("/", "_"), sourceGeometry: sg }));

if (geoLevel === "ctvrt") {
  const hit = contexts.find((c) => c.dbId === geoId);
  if (!hit) fail(`ctvrt ${geoId} neni v registru GEO. Kontext se musi zalozit v yield.ts driv, nez se pullne.`);
  if (hit.sourceGeometry !== sourceGeometry)
    fail(`${geoId} ma v registru sourceGeometry "${hit.sourceGeometry}", dostal jsem "${sourceGeometry}"`);
  const siblings = contexts.filter((c) => c.sourceGeometry === sourceGeometry && c.dbId !== geoId);
  if (siblings.length)
    console.log(`INFO  geometrie "${sourceGeometry}" je sdilena, tentyz dataset patri i do: ${siblings.map((s) => s.dbId).join(", ")} (pullovat znovu = platit kvotu dvakrat za totez)`);
}

// ---------------------------------------------------------------- obdobi
const months = doc?.meta?.months;
let monthsFrom = arg("months-from"), monthsTo = arg("months-to");
if (Array.isArray(months) && months.length) {
  monthsFrom = monthsFrom || String(months[0]).replace("-", "_");
  monthsTo = monthsTo || String(months[months.length - 1]).replace("-", "_");
} else if (typeof months === "string" && months.includes("..")) {
  const [a, b] = months.split("..").map((s) => s.trim().replace("-", "_"));
  monthsFrom = monthsFrom || a; monthsTo = monthsTo || b;
}
if (!monthsFrom || !monthsTo)
  fail("nejde urcit obdobi; artefakt nema meta.months a nedostal jsem --months-from/--months-to");

// ---------------------------------------------------------------- raw -> unique -> usable
const requested = (arg("bands") || "").split(",").map((s) => s.trim()).filter(Boolean);
const { usable, rejected, unknown, rawKeys, unique } = deriveBands(doc);

console.log(`\nARTEFAKT  ${rel}`);
console.log(`  sha256  ${sha256}`);
console.log(`  bajtu   ${statSync(artifact).size}`);
console.log(`  obdobi  ${monthsFrom} .. ${monthsTo}`);
console.log(`  geo     ${geoId} (${geoLevel}) / geometrie ${sourceGeometry} / source ${source}`);
console.log(`\nRAW -> UNIQUE -> USABLE`);
console.log(`  raw      ${rawKeys.length} klicu: ${rawKeys.join(", ") || "-"}`);
console.log(`  unique   ${unique.length} pasem: ${unique.join(", ") || "-"}`);
console.log(`  usable   ${usable.length} pasem: ${usable.map((u) => u.band).join(", ") || "-"}`);
if (unknown.length) warn(`neznama pasma ignorovana: ${unknown.join(", ")}`);
for (const r of rejected) warn(`pasmo ${r.band} NEPOUZITELNE: ${r.why.join("; ")}`);

if (!usable.length) fail("zadne pouzitelne pasmo, nic se nezapisuje");

// pull_state: complete jen kdyz vsechna pozadovana pasma prosla
const missing = requested.filter((b) => !usable.some((u) => u.band === b));
const pullState = requested.length && missing.length === 0 ? "complete" : "partial";
if (missing.length) warn(`pozadovana pasma chybi: ${missing.join(", ")} -> pull_state zustava partial`);
if (!requested.length) warn("bez --bands nejde rict, jestli je pull uplny -> pull_state partial");

console.log(`\nODVOZENA CISLA`);
for (const u of usable) {
  console.log(`  ${u.band.padEnd(4)} n_min ${String(u.nMin).padStart(5)}  n_mean ${String(u.nMean).padStart(5)}  ` +
    `adr ${String(u.annualAdr).padStart(5)}  revpar ${String(u.annualRevpar).padStart(5)}  ` +
    `annual_rev ${String(u.annualRev).padStart(9)}  reliable ${u.nMin >= RELIABLE_MIN_N}`);
}

// Kontrola prekryvu je DIAGNOSTIKA, ne invariant: geometrie se muzou prekryvat
// a PriceLabs vraci agregat bez listing ID, takze soucet ctvrti smi okres prerust.
if (geoLevel === "ctvrt") {
  const parents = (arg("parents") || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (parents.length) console.log(`\nDIAGNOSTIKA  po zapisu porovnej soucet ctvrti proti ${parents.join(", ")} (warning, ne invariant)`);
}

// ---------------------------------------------------------------- SQL
const q = (s) => (s === null || s === undefined ? "null" : "'" + String(s).replace(/'/g, "''") + "'");
const jb = (o) => q(JSON.stringify(o)) + "::jsonb";
const pulledAt = arg("pulled-at") || new Date().toISOString().slice(0, 10);
const note = `${doc?.meta?.geometry || sourceGeometry} | artefakt ${rel} sha256 ${sha256.slice(0, 16)}`;
const requests = arg("requests");

if (flag("emit-sql")) {
  const L = [];
  L.push("begin;");
  L.push(`-- ${rel}  sha256 ${sha256}`);
  L.push(`-- pull_state: partial pri zapisu, complete az kdyz projdou vsechna pozadovana pasma`);
  L.push(`insert into pl_pull_log (slug, source_geometry, geo_ids, bands, requests_used, quota_note, outcome, notes)`);
  L.push(`  values (${q(slug)}, ${q(sourceGeometry)}, array[${q(geoId)}], array[${usable.map((u) => q(u.band)).join(",")}],`);
  L.push(`          ${requests ? Number(requests) : "null"}, ${requests ? q("zmereno po pullu") : q("NEZAZNAMENANO - doplnit skutecnou spotrebu")}, ${q("started")}, ${q(note)});`);
  for (const u of usable) {
    L.push(`insert into str_market (geo_id, geo_level, geo_label, parent_geos, band, source, source_geometry,`);
    L.push(`    annual_rev, n_min, n_mean, annual_occ, annual_adr, annual_revpar, reliable,`);
    L.push(`    months_from, months_to, monthly, source_note, pulled_at, pull_state, import_version)`);
    L.push(`  values (${q(geoId)}, ${q(geoLevel)}, ${q(arg("label") || geoId)}, ` +
      `array[${(arg("parents") || "").split(",").map((s) => s.trim()).filter(Boolean).map(q).join(",")}]::text[], ${q(u.band)}, ${q(source)}, ${q(sourceGeometry)},`);
    L.push(`          ${u.annualRev}, ${u.nMin}, ${u.nMean}, ${u.annualOcc ?? "null"}, ${u.annualAdr}, ${u.annualRevpar}, ${u.nMin >= RELIABLE_MIN_N},`);
    L.push(`          ${q(monthsFrom)}, ${q(monthsTo)}, ${jb(u.monthly)}, ${q(note)}, ${q(pulledAt)}::date, 'partial', ${q(IMPORT_VERSION)})`);
    L.push(`  on conflict (geo_id, source, months_from, months_to, band) do update set`);
    L.push(`    annual_rev = excluded.annual_rev, n_min = excluded.n_min, n_mean = excluded.n_mean,`);
    L.push(`    annual_occ = excluded.annual_occ, annual_adr = excluded.annual_adr, annual_revpar = excluded.annual_revpar,`);
    L.push(`    monthly = coalesce(str_market.monthly, excluded.monthly), source_geometry = excluded.source_geometry,`);
    L.push(`    import_version = excluded.import_version, updated_at = now();`);
  }
  if (pullState === "complete") {
    L.push(`update str_market set pull_state = 'complete'`);
    L.push(`  where geo_id = ${q(geoId)} and source = ${q(source)} and months_from = ${q(monthsFrom)} and months_to = ${q(monthsTo)};`);
  }
  L.push(`update pl_pull_log set outcome = ${q(pullState)}, finished_at = now()`);
  L.push(`  where id = (select id from pl_pull_log where slug = ${q(slug)} order by started_at desc limit 1);`);
  L.push("commit;");
  console.log("\n-- ==== SQL ====");
  console.log(L.join("\n"));
} else {
  console.log(`\n(dry-run: nic se nezapisuje. SQL vypises pres --emit-sql)`);
}
console.log(`\npull_state -> ${pullState}`);
if (!requests) warn("skutecna spotreba kvoty nezadana (--requests N). Zmer ji po pullu, neodhaduj.");
