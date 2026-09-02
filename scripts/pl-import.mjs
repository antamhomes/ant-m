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
import { reconcile, canonical, sha256 as hashOf } from "./pl-raw.mjs";
import { readdirSync } from "node:fs";

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
const contexts = geoBlock[1].split("\n").map((line) => {
  const id = line.match(/id: "([^"]+)"/)?.[1];
  const sg = line.match(/sourceGeometry: "([^"]+)"/)?.[1];
  if (!id || !sg) return null;
  const eff = line.match(/effect: (-?[\d.]+), n: (\d+)/);
  const fb = line.match(/fallback: "district", reason: "([^"]+)"/);
  // Kontext BEZ deklarovaneho LTR stavu je nejednoznacny -> tvrdy fail niz.
  const ltr = eff ? { kind: "effect", effect: Number(eff[1]), n: Number(eff[2]) }
            : fb  ? { kind: "fallback", reason: fb[1] }
            : null;
  return { id, dbId: id.replace("/", "_"), sourceGeometry: sg, ltr };
}).filter(Boolean);

const ltrReport = [];
if (geoLevel === "ctvrt") {
  const hit = contexts.find((c) => c.dbId === geoId);
  if (!hit) fail(`ctvrt ${geoId} neni v registru GEO. Kontext se musi zalozit v yield.ts driv, nez se pullne.`);
  if (hit.sourceGeometry !== sourceGeometry)
    fail(`${geoId} ma v registru sourceGeometry "${hit.sourceGeometry}", dostal jsem "${sourceGeometry}"`);
  const siblings = contexts.filter((c) => c.sourceGeometry === sourceGeometry && c.dbId !== geoId);
  if (siblings.length)
    console.log(`INFO  geometrie "${sourceGeometry}" je sdilena, tentyz dataset patri i do: ${siblings.map((s) => s.dbId).join(", ")} (pullovat znovu = platit kvotu dvakrat za totez)`);

  // BRANA: geometrii schvaluje clovek. Spatny polygon nevrati chybu, vrati
  // verohodna cisla o jinem miste, takze se porovnava ZNAK PO ZNAKU.
  const approved = arg("approved-geometry");
  if (!approved)
    fail("chybi --approved-geometry \"<presny label>\". Vyber polygonu je lidske rozhodnuti, skript ho neuhadne.");
  const inArtifact = doc?.meta?.geometry;
  if (!inArtifact) fail("artefakt nema meta.geometry, nelze overit proti schvalenemu labelu");
  if (inArtifact !== approved)
    fail(`geometrie NESEDI znak po znaku.\n  schvaleno: "${approved}"\n  artefakt:  "${inArtifact}"\nZadne fuzzy parovani. Bud je to tentyz polygon, nebo se nepokracuje.`);

  // BRANA: LTR kontext musi byt vyslovne receny a musi sedet s geo/geometrii.
  const ltrCtx = arg("ltr-context");
  if (!ltrCtx)
    fail("chybi --ltr-context <okres/geometrie>. Bez nej nejde rict, proti jakemu najmu se to bude porovnavat.");
  const ctx = contexts.find((c) => c.id === ltrCtx);
  if (!ctx) fail(`--ltr-context ${ltrCtx} neni v registru GEO`);
  if (ctx.dbId !== geoId)
    fail(`--ltr-context ${ltrCtx} patri k ${ctx.dbId}, ale importuje se ${geoId}. STR a LTR by sedely na jine geografii.`);
  if (!ctx.ltr)
    fail(`${ltrCtx} nema v GEO deklarovany LTR stav (ani effect, ani fallback). Nejednoznacne napojeni = tvrdy fail.`);

  // Deklarovany fallback na okres je POVOLENY, mlcici neni.
  for (const c of [ctx, ...siblings]) {
    if (!c.ltr) fail(`${c.id}: chybi LTR stav v GEO, nejednoznacne napojeni`);
    ltrReport.push(c.ltr.kind === "effect"
      ? `  ${c.id.padEnd(24)} LTR efekt ${c.ltr.effect >= 0 ? "+" : ""}${(c.ltr.effect * 100).toFixed(1)} % (n=${c.ltr.n})`
      : `  ${c.id.padEnd(24)} LTR FALLBACK na okres — ${c.ltr.reason}`);
  }
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

// BRANA: do produkce smi jen PRIMO MERENE pasmo. Rozpad jednoho souctu
// celoprazskym pomerem je analyza; v MARKET_CTVRT by byl k nerozeznani od
// pullnuteho cisla, proto sem nesmi ani omylem.
const bandsBasis = doc?.meta?.bands_basis;
// U CTVRTI je provenience POVINNA: tam vznika riziko, ze se jeden soucet
// rozpadne celoprazskym pomerem a vyda za merena pasma.
// U OKRESU se pole nevyzaduje: devet artefaktu z 8/2026 se pullovalo po
// pasmech primo a vzniklo drive nez tohle pole. Prepisovat je jen kvuli
// popisku by zmenilo jejich sha256, a surovy artefakt je autorita.
if (!bandsBasis) {
  if (geoLevel === "ctvrt")
    fail("ctvrtovy artefakt nema meta.bands_basis. Bez provenience pasma se produkcni import nedela — prozen ho pres pl-artifact.mjs.");
  console.log("WARN  artefakt nema meta.bands_basis (predchazi zavedeni pole). U okresu se bere jako measured: pasma se pullovala primo.");
}
for (const u of (bandsBasis ? usable : [])) {
  const b = bandsBasis[u.band];
  if (!b || !b.basis) fail(`pasmo ${u.band} nema v artefaktu zapsany basis`);
  if (b.basis !== "measured")
    fail(`pasmo ${u.band} je "${b.basis}"${b.from ? ` (z ${b.from}: ${b.reason})` : ""}.\n`
       + "Do produkcniho importu smi jen measured. Rozpad zustava v analyze.");
}

// BRANA: SYROVA PROVENIENCE. "measured" musi ukazovat na zachycenou odpoved
// a artefakt se z ni musi porad reprodukovat. Tohle je rozdil mezi
// "artefakt tvrdi spravnou provenienci" a "cisla opravdu prisla z PriceLabs".
const rawProv = doc?.meta?.raw_provenance;
const rawReport = [];
if (geoLevel === "ctvrt") {
  if (!rawProv)
    fail("ctvrtovy artefakt nema meta.raw_provenance.\n"
       + "  Bez odkazu na syrovou odpoved je 'measured' netestovatelne tvrzeni\n"
       + "  (presne tak prosly fixtures v _to_delete/gate-test/).\n"
       + "  Zachyt odpoved pres pl-raw.mjs a prozen znovu pl-artifact.mjs.");
  for (const u of usable) {
    const pr = rawProv[u.band];
    if (!pr) fail(`pasmo ${u.band} nema raw_provenance`);
    if (!pr.file || !existsSync(pr.file))
      fail(`syrova odpoved pro ${u.band} chybi na disku: ${pr.file}`);
    let env;
    try { env = JSON.parse(readFileSync(pr.file, "utf8")); }
    catch (e) { fail(`${pr.file} neni platny JSON: ${e.message}`); }
    const h = hashOf(canonical(env));
    if (h !== pr.raw_sha256)
      fail(`syrova odpoved pro ${u.band} se ZMENILA po vzniku artefaktu.\n`
         + `  artefakt ceka ${pr.raw_sha256}\n  soubor ma   ${h}`);
    if (env?.response?.geometry !== doc?.meta?.geometry)
      fail(`${u.band}: geometrie v syrove odpovedi "${env?.response?.geometry}" != artefakt "${doc?.meta?.geometry}"`);
    const why = reconcile(env, doc[u.band], (doc.meta.months || []).map((m) => String(m).replace("-", "_")));
    if (why.length)
      fail(`pasmo ${u.band} uz NEODPOVIDA syrove odpovedi:\n` + why.slice(0, 8).map((w) => "  - " + w).join("\n"));
    rawReport.push(`  ${u.band.padEnd(4)} ${pr.raw_sha256.slice(0, 16)}…  ${pr.file}`);
  }
} else if (!rawProv) {
  console.log("WARN  artefakt nema meta.raw_provenance (predchazi zavedeni zachytu 2. 9. 2026).\n"
            + "WARN  U devíti okresnich artefaktu z 8/2026 se syrova odpoved neuchovala. Prepisovat je\n"
            + "WARN  zpetne by zmenilo jejich sha256 a syrovy artefakt je autorita, takze zustavaji tak,\n"
            + "WARN  jak jsou — ale jejich retezec konci u artefaktu, ne u odpovedi PriceLabs.");
}

// SEKUNDARNI POJISTKA: shodny payload pod jinou geometrii.
// Chyta nahodnou kontaminaci fixture/kopii. NENI to dukaz puvodu — kopie
// s jednim zmenenym cislem projde. Proto az za syrovou proveniencí, ne misto ní.
const payloadHash = (o) => hashOf(canonical({
  occ: o.occ, adr: o.adr, revpar: o.revpar,
  active_listings: o.active_listings, avg_revenue: o.avg_revenue,
}));
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (e.name.endsWith(".json") && !e.name.endsWith(".meta.json") && !e.name.endsWith(".raw.json")) out.push(f);
  }
  return out;
};
const dupes = [];
for (const other of walk("data")) {
  if (path.resolve(other) === path.resolve(artifact)) continue;
  let od; try { od = JSON.parse(readFileSync(other, "utf8")); } catch { continue; }
  const otherGeom = od?.meta?.geometry;
  if (!otherGeom || otherGeom === doc?.meta?.geometry) continue;
  for (const u of usable) {
    for (const ob of Object.keys(od)) {
      if (ob === "meta" || !od[ob]?.adr) continue;
      if (payloadHash(doc[u.band]) === payloadHash(od[ob]))
        dupes.push(`${u.band} je BAJT V BAJT ${other} [${ob}] (geometrie "${otherGeom}")`);
    }
  }
}
if (dupes.length) {
  const why = arg("allow-duplicate-payload");
  for (const d of dupes) console.error("DUPLICITA  " + d);
  if (!why || why === true)
    fail("shodny payload pod jinou geometrii. Dve mista nemaji stejna cisla na setinu.\n"
       + "  Nejpravdepodobnejsi pricina je zkopirovany soubor nebo fixture.\n"
       + "  Kdyz to presto dava smysl, rekni proc: --allow-duplicate-payload \"<duvod>\"");
  console.log(`WARN  duplicita povolena rucne: ${why}`);
}

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

// ---------------------------------------------------------------- prejimka
// Vyplneny zaznam podle docs/pricelabs-acceptance.md. Tiskne se PRED SQL:
// co se nedostane sem, nedostane se do databaze.
const requests = arg("requests");
console.log(`\nPREJIMKA (docs/pricelabs-acceptance.md)`);
console.log(`   1 source_geometry_id ....... ${sourceGeometry}`);
console.log(`   2 kontexty geometrie ....... ${contexts.filter((c) => c.sourceGeometry === sourceGeometry).map((c) => c.id).join(", ") || "(okres/praha)"}`);
console.log(`   3 schvalena geometrie ...... ${arg("approved-geometry") ? `"${arg("approved-geometry")}" = artefakt` : "(neplati pro okres/praha)"}`);
console.log(`   4 Sreality kontext ......... ${arg("ltr-context") || "(neplati pro okres/praha)"}`);
console.log(`   5 okno ..................... ${monthsFrom} .. ${monthsTo}`);
console.log(`   6 pasma uplna .............. ${usable.map((u) => u.band).join(", ")}${missing.length ? `  CHYBI: ${missing.join(", ")}` : ""}`);
console.log(`   7 mesicni rada ............. ${usable.every((u) => (u.monthly.active_listings || []).length === MONTHS_EXPECTED) ? "12/12 u vsech pasem" : "NEUPLNA"}`);
console.log(`   8 n_mean / n_min z rady .... ${usable.map((u) => `${u.band} ${u.nMean}/${u.nMin}`).join("  ")}`);
console.log(`   9 reliable z n_min (>=${RELIABLE_MIN_N}) .. ${usable.map((u) => `${u.band} ${u.nMin >= RELIABLE_MIN_N}`).join("  ")}`);
console.log(`  10 artefakt + sha256 ........ ${rel}  ${sha256.slice(0, 16)}…`);
console.log(`  11 raw -> unique -> usable .. ${rawKeys.length} -> ${unique.length} -> ${usable.length}`);
console.log(`  12 prirozeny klic ........... (geo_id, source, ${monthsFrom}, ${monthsTo}, band) — duplicitu odmitne PK`);
console.log(`  13 idempotence .............. shodny rerun nechá radek beze zmeny (Step 0)`);
console.log(`  14 konflikt zastavi ......... trigger str_market_no_history_rewrite`);
if (ltrReport.length) { console.log(`  15 LTR vzorek / fallback ....`); for (const l of ltrReport) console.log(l); }
console.log(`  16 STR i LTR tyz kontext .... ${arg("ltr-context") ? "ANO, overeno proti GEO" : "(neplati pro okres/praha)"}`);
console.log(`  17 pull_state ............... ${pullState}`);
console.log(`  18 puvod pasem .............. ${usable.map((u) => `${u.band} ${bandsBasis?.[u.band]?.basis ?? "measured (legacy)"}`).join("  ")}`);
console.log(`  19 syrova odpoved .......... ${rawProv ? "ANO, haš sedi a artefakt se z ni reprodukuje" : "CHYBI (legacy artefakt pred 2. 9. 2026)"}`);
for (const l of rawReport) console.log(l);
console.log(`  20 duplicita payloadu ...... ${dupes.length ? `!! ${dupes.length} shod` : "zadna shoda pod jinou geometrii"}`);
console.log(`     kvota (skutecna) ........ ${requests ? `${requests} dotazu` : "!! NEZAZNAMENANO"}`);
if (!requests)
  console.log("     !! Spotreba kvoty neni znama. NEBLOKUJE import (data jsou platna i tak),\n"
            + "     !! ale doplnit se musi rucne do pl_pull_log, jinak se dalsi davka planuje naslepo.");

// ---------------------------------------------------------------- SQL
const q = (s) => (s === null || s === undefined ? "null" : "'" + String(s).replace(/'/g, "''") + "'");
const jb = (o) => q(JSON.stringify(o)) + "::jsonb";
const pulledAt = arg("pulled-at") || new Date().toISOString().slice(0, 10);
const note = `${doc?.meta?.geometry || sourceGeometry} | artefakt ${rel} sha256 ${sha256.slice(0, 16)}`;

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
    // FILTR NA PASMO JE POVINNY. Bez nej by se na "complete" prepnul i kazdy
    // jiny radek te same geografie a okna — treba stary souhrnny radek pasma
    // "all", ktery v tomhle artefaktu neni a jehoz uplnost nikdo nedolozil.
    // Nachytano 2. 9. 2026 pri inspekci SQL pred importem Noveho Mesta.
    L.push(`update str_market set pull_state = 'complete'`);
    L.push(`  where geo_id = ${q(geoId)} and source = ${q(source)} and months_from = ${q(monthsFrom)} and months_to = ${q(monthsTo)}`);
    L.push(`    and band in (${usable.map((u) => q(u.band)).join(", ")});`);
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
