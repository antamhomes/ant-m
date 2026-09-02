#!/usr/bin/env node
// ZÁCHYT SYROVÉ ODPOVĚDI. Běží PŘED jakoukoli transformací.
//
// Proč vůbec: brána do 2. 9. 2026 dokazovala, že artefakt je dobře tvarovaný
// a TVRDÍ správnou provenienci. Nedokazovala, že ta čísla přišla z PriceLabs.
// Fixtures v _to_delete/gate-test/ (doslovné kopie praha3/praha1 s labelem
// Nového a Starého Města, basis measured) prošly každou mechanickou kontrolou.
// Tenhle soubor je ten chybějící článek: syrová odpověď + kontext dotazu,
// zahašované, a odvozený artefakt na ten haš ukazuje.
//
// NENÍ to důkaz, že PriceLabs mluví pravdu. Je to důkaz, že náš artefakt
// odpovídá tomu, co PriceLabs vrátil.
//
//   node scripts/pl-raw.mjs --band 2BR --slug nove_mesto \
//     --question "..." --response /tmp/resp.json --fx /tmp/fx.json \
//     --geometry-label "New Town official boundary" --geometry-source openstreetmap \
//     [--session-id ...] [--geometry-token ...] [--out data/pricelabs-raw/...]

import { readFileSync, writeFileSync, existsSync, mkdirSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import path from "node:path";
import { pullWindow, WINDOW_MONTHS } from "./pl-window.mjs";

export const CAPTURE_VERSION = "raw.1";
/** Peněžní pole. POZOR: PriceLabs je vrací UŽ PŘEVEDENÁ do CZK
 *  (`currency_conversion_applied: true`, `base_currency: USD`,
 *  `display_currency: CZK`) — převod dělá jejich strana, ne naše.
 *  Ověřeno na pullu Nového Města 2. 9. 2026. `fx` proto zůstává volitelné
 *  a implicitně je identita; kdyby někdy přišla nepřevedená čísla, tabulka
 *  kurzů se do envelope zapíše a rekonciliace ji začne vynucovat. */
export const FX_FIELDS = ["adr", "revpar", "avg_revenue"];
export const PLAIN_FIELDS = ["occ", "active_listings"];
export const ALL_FIELDS = [...PLAIN_FIELDS, ...FX_FIELDS];

/** Stabilní JSON pro hašování: klíče seřazené, žádné formátování navíc. */
export const canonical = (v) =>
  JSON.stringify(v, (_k, val) =>
    val && typeof val === "object" && !Array.isArray(val)
      ? Object.fromEntries(Object.keys(val).sort().map((k) => [k, val[k]]))
      : val);

export const sha256 = (s) => createHash("sha256").update(s).digest("hex");

/** Mapa: pole ve strukturovanem zaznamu PriceLabs -> nase jmeno rady. */
export const FIELD_MAP = {
  occ: "occupancy_pct", adr: "adr", revpar: "revpar",
  active_listings: "active_listings", avg_revenue: "avg_revenue",
};

/**
 * VYTAHNE RADY VYHRADNE ZE STRUKTUROVANYCH ZAZNAMU `verbatim.data[]`.
 *
 * Proc to dela skript a ne clovek: vypravna cast odpovedi PriceLabs
 * PROKAZATELNE LZE. 2. 9. 2026 tvrdila u Prahy 2 "136 active listings on
 * average", skutecny prumer je 127 (136 je cervencova hodnota). U Noveho
 * Mesta hlasila "July 2025 to August 2026", zatimco data byla 2025_08..2026_07.
 * U kruhu 15 km oznacila trh jako "New Town (Nove Mesto)".
 * Trikrat spatne, pokazde zatimco `data[]` bylo spravne.
 *
 * Rucne psany seznam cisel je presne to misto, kde muze veta z prozy
 * proklouznout do artefaktu. Proto se rady neprebiraji, nybrz ctou.
 */
export function extractFromResponse(verbatim, months) {
  const rows = verbatim?.data;
  if (!Array.isArray(rows)) throw new Error("odpoved nema pole data[] — proza se jako zdroj nepouziva");
  const got = rows.map((r) => String(r?.month ?? "").replace("-", "_"));

  // 1. Kazdy POZADOVANY mesic prave jednou. Chybejici i zdvojeny = tvrdy fail.
  const at = {};
  for (const m of months) {
    const hits = got.reduce((a, g, i) => (g === m ? [...a, i] : a), []);
    if (hits.length === 0) throw new Error(`v odpovedi chybi pozadovany mesic ${m}`);
    if (hits.length > 1) throw new Error(`mesic ${m} je v odpovedi ${hits.length}x`);
    at[m] = hits[0];
  }

  // 2. NADBYTECNE radky smi lezet jen STRIKTNE MIMO okno.
  // Okno urcuje pullWindow() PREDEM, nezavisle na tom, co provider vrati;
  // proto je vyrazeni mesice mimo nej aplikace pravidla, ne uhyb pred daty.
  // Rozhoduje POZICE V KALENDARI, nikdy ne to, jestli radek "vypada nedojete".
  const lo = months[0], hi = months[months.length - 1];
  const excluded = [];
  got.forEach((g, i) => {
    if (months.includes(g)) return;
    if (g >= lo && g <= hi)
      throw new Error(`mesic ${g} lezi UVNITR okna ${lo}..${hi}, ale nepatri do nej — odpoved nema ocekavany tvar`);
    excluded.push({ month: g, index: i, reason: `mimo pozadovane okno uzavrenych mesicu ${lo}..${hi}` });
  });

  // 3. Hodnoty JEN z pozadovanych mesicu, v poradi okna.
  const values = {};
  for (const [ours, theirs] of Object.entries(FIELD_MAP)) {
    values[ours] = months.map((m) => {
      const v = rows[at[m]]?.[theirs];
      if (typeof v !== "number" || !Number.isFinite(v))
        throw new Error(`data[${at[m]}] (${m}) nema ciselne pole "${theirs}"`);
      return v;
    });
  }
  return { values, excluded };
}

/** Všechna čísla kdekoli v odpovědi, zaokrouhlená na 2 des. místa. */
export const numbersIn = (node, acc = new Set()) => {
  if (typeof node === "number" && Number.isFinite(node)) acc.add(Math.round(node * 100) / 100);
  else if (Array.isArray(node)) for (const v of node) numbersIn(v, acc);
  else if (node && typeof node === "object") for (const v of Object.values(node)) numbersIn(v, acc);
  return acc;
};

/**
 * SYROVÁ ODPOVĚĎ -> PÁSMO ARTEFAKTU. Jádro auditní stopy.
 * Vrací pole důvodů; prázdné pole = sedí.
 */
export function reconcile(env, series, months) {
  const why = [];
  const ex = env?.extracted?.values ?? env?.extracted?.usd;
  const fx = env?.fx ?? null;              // null = identita, viz FX_FIELDS
  if (!ex) return ["envelope nema extracted.values"];

  const envMonths = env?.request?.window?.months;
  if (!Array.isArray(envMonths) || envMonths.join(",") !== months.join(","))
    why.push(`okno envelope ${envMonths?.[0]}..${envMonths?.[envMonths.length - 1]} != artefakt ${months[0]}..${months[months.length - 1]}`);

  // 1. OBSAŽENOST: každé tvrzené USD číslo musí v odpovědi doslova být.
  // Tohle je to, co zastaví vymyšlenou nebo zkopírovanou řadu.
  const pool = numbersIn(env?.response?.verbatim);
  for (const f of ALL_FIELDS) {
    const a = ex[f];
    if (!Array.isArray(a) || a.length !== WINDOW_MONTHS) { why.push(`extracted.values.${f} neni rada ${WINDOW_MONTHS} mesicu`); continue; }
    a.forEach((v, i) => {
      if (!pool.has(Math.round(v * 100) / 100))
        why.push(`extracted.values.${f}[${i}] = ${v} se v syrove odpovedi vubec nevyskytuje`);
    });
  }

  // 2. NEPŘEPOČÍTÁVANÁ POLE musí sedět přesně.
  for (const f of PLAIN_FIELDS) {
    (ex[f] || []).forEach((v, i) => {
      if (series?.[f]?.[i] !== v) why.push(`${f}[${i}]: syrove ${v} != artefakt ${series?.[f]?.[i]}`);
    });
  }

  // 3. KURZ: artefakt = round2(usd * kurz mesice). Chytí i tiše špatnou tabulku kurzů.
  for (const f of FX_FIELDS) {
    (ex[f] || []).forEach((v, i) => {
      const r = fx === null ? 1 : fx[months[i]];
      if (typeof r !== "number") { why.push(`chybi kurz pro ${months[i]}`); return; }
      const want = Math.round(v * r * 100) / 100;
      const got = series?.[f]?.[i];
      // BEZ prevodu se netoleruje NIC: artefakt se ma rovnat odpovedi.
      // Tolerance 0,01 patri jen k zaokrouhleni po nasobeni kurzem, jinak
      // by propadl rozdil o setinu — coz se pri zavedeni identity stalo.
      const tol = fx === null ? 0 : 0.011;
      if (typeof got !== "number" || Math.abs(want - got) > tol)
        why.push(fx === null
          ? `${f}[${i}] (${months[i]}): odpoved ${v}, artefakt ${got}`
          : `${f}[${i}] (${months[i]}): ${v} x kurz ${r} = ${want}, artefakt ma ${got}`);
    });
  }
  return why;
}

// ------------------------------------------------------------------ CLI
// Spusteno primo? Porovnava se REALNA cesta, aby to fungovalo i pres symlink.
const isMain = (() => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } })();
if (isMain) {
  const argv = process.argv.slice(2);
  const arg = (n, d = null) => { const i = argv.indexOf("--" + n); return i === -1 ? d : argv[i + 1]; };
  const fail = (m) => { console.error("STOP: " + m); process.exit(1); };

  const band = arg("band"), slug = arg("slug"), question = arg("question");
  const respPath = arg("response"), fxPath = arg("fx");
  const gLabel = arg("geometry-label"), gSource = arg("geometry-source");
  if (!band || !slug || !question || !respPath || !fxPath || !gLabel || !gSource)
    fail("chybi --band / --slug / --question / --response / --fx / --geometry-label / --geometry-source");
  for (const p of [respPath, fxPath]) if (!existsSync(p)) fail(`neexistuje: ${p}`);

  const win = pullWindow(arg("today") ? new Date(arg("today")) : new Date());
  const verbatim = JSON.parse(readFileSync(respPath, "utf8"));
  const fxDoc = JSON.parse(readFileSync(fxPath, "utf8"));
  const fx = fxDoc.fx ?? null;
  // Rady se VZDYCKY ctou ze strukturovanych zaznamu. Rucne dodany seznam
  // se prijme jen jako kontrola a musi se shodovat do posledniho cisla.
  let extracted;
  try {
    const ex = extractFromResponse(verbatim, win.months);
    extracted = { currency: verbatim?.display_currency ?? null, values: ex.values, excluded_rows: ex.excluded };
  }
  catch (e) { fail(e.message); }
  if (extracted.excluded_rows.length)
    for (const e of extracted.excluded_rows)
      console.log(`    vyrazeno  ${e.month}: ${e.reason}`);
  const handed = fxDoc.extracted?.values ?? fxDoc.extracted?.usd;
  if (handed) {
    for (const [k, arr] of Object.entries(extracted.values)) {
      const h = handed[k];
      if (!Array.isArray(h)) fail(`rucni kontrola nema radu ${k}`);
      const bad = arr.findIndex((v, i) => v !== h[i]);
      if (bad !== -1)
        fail(`rucne dodana rada ${k}[${bad}] = ${h[bad]}, ale ve strukturovanych datech je ${arr[bad]}.\n`
           + "  Zdrojem je data[], ne proza ani prepis. Oprav vstup.");
    }
    console.log("    kontrola  rucne dodane rady sedi na data[]");
  }
  if (fx) for (const m of win.months) if (typeof fx[m] !== "number") fail(`chybi kurz pro ${m}`);

  const env = {
    capture_version: CAPTURE_VERSION,
    captured_at: new Date().toISOString(),
    request: {
      tool: "mcp__pricelabs__market_research",
      question,
      question_sha256: sha256(question),
      band,
      slug,
      window: { from: win.from, to: win.to, months: win.months },
      session_id: arg("session-id") || null,
      geometry_token: arg("geometry-token") || null,
    },
    response: {
      selected_geometry_label: gLabel,
      selected_geometry_source: gSource,
      geometry: `${gLabel} (${gSource})`,
      verbatim,
    },
    extracted,
    fx,                                       // null = PriceLabs uz prevedl
    currency: {
      display: verbatim?.display_currency ?? null,
      base: verbatim?.base_currency ?? null,
      conversion_applied: verbatim?.currency_conversion_applied ?? null,
      note: verbatim?.currency_conversion_note ?? null,
    },
  };

  const out = arg("out") || `data/pricelabs-raw/${slug}.${band}.raw.json`;
  mkdirSync(path.dirname(out), { recursive: true });
  const body = JSON.stringify(env, null, 1);
  writeFileSync(out, body);
  const h = sha256(canonical(env));
  writeFileSync(out.replace(/\.json$/, ".sha256"), h + "\n");

  console.log(`OK  ${out}`);
  console.log(`    raw_sha256 ${h}`);
  console.log(`    geometrie  ${env.response.geometry}`);
  console.log(`    okno       ${win.from} .. ${win.to}`);
  console.log(`    pasmo      ${band}`);
  console.log(`\nDalsi krok: pl-artifact.mjs ... --raw ${band}=${out}`);
}
