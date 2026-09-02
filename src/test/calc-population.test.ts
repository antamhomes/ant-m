import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import {
  ctvrtiOf, ownerMonthly, rentFor, bucketsFor, ctvrtRentFactor,
  type LocationKey, type SizeKey, type SeasonKey,
} from "../lib/yield";

/** Lokality nabízené kalkulačkou: 10 pražských obvodů + „jinde". */
const LOCS = ["praha1","praha2","praha3","praha4","praha5",
              "praha6","praha7","praha8","praha9","praha10","jinde"] as const;
const SIZES: SizeKey[] = ["1kk","2kk","3kk","4kk"];
const SEASONS: SeasonKey[] = ["year","summer","winter","xmas"];

/**
 * Stavy „lokalita × čtvrť" ODVOZENÉ Z BĚHU, ne zapsané ručně.
 * Lokalita bez čtvrtí = 1 stav. Lokalita s čtvrtěmi = N čtvrtí
 * + „Ostatní" (null) + nezodpovězeno (undefined).
 */
export function locationStates(): { loc: string; ctvrt: string | null | undefined }[] {
  const out: { loc: string; ctvrt: string | null | undefined }[] = [];
  for (const loc of LOCS) {
    const ct = ctvrtiOf(loc);
    if (ct.length === 0) { out.push({ loc, ctvrt: undefined }); continue; }
    out.push({ loc, ctvrt: undefined });
    for (const c of ct) out.push({ loc, ctvrt: c.id });
    out.push({ loc, ctvrt: null });
  }
  return out;
}

/** Celá veřejná vstupní množina. */
export function population() {
  const rows: any[] = [];
  for (const st of locationStates())
    for (const size of SIZES)
      for (const b of bucketsFor(size))
        for (const season of SEASONS) {
          // DVĚ DŘÍVĚJŠÍ CHYBY HARNESSU, obě opravené 2. 9. 2026:
          //  1) pole se jmenuje representativeM2, ne presetM2. S překlepem šlo
          //     do modelu m2 = undefined, model spadl na typicalArea a všechny
          //     čtyři kbelíky vracely TOTÉŽ číslo — baseline tedy vůbec
          //     neprověřovala překlopení pásem ani nic závislého na ploše.
          //  2) kbelík "xl" má representativeM2 null (nadměrný byt). Volat s ním
          //     rentFor znamenalo dělit nulou a dostat Infinity. Za běhu takový
          //     stav nenastane — web ho blokuje jako „posoudíme individuálně" —
          //     a baseline to musí zrcadlit, ne vyrábět nesmysl.
          const id = `${st.loc}|${st.ctvrt === undefined ? "?" : st.ctvrt ?? "-"}|${size}|${b.id}|${season}`;
          const m2 = b.representativeM2 ?? null;
          if (m2 === null) { rows.push({ id, oversized: true, supported: false }); continue; }
          const r = ownerMonthly(st.loc, size, { season, m2, ctvrt: st.ctvrt });
          const ltr = st.loc === "jinde" ? 0 : rentFor(st.loc as LocationKey, size, m2, "mix", st.ctvrt);
          rows.push({
            id, oversized: false, m2,
            supported: r.supported, band: r.band, guests: r.guests,
            // POZOR: OwnerMonthly nemá pole czk/gross/occ. Do 2. 9. 2026 se tu
            // zachytávaly jako null, takže baseline NEHLÍDALA částky pro majitele.
            // Správná pole jsou low/mid/high a hrubé tržby v market/antam.
            low: (r as any).low ?? null, mid: (r as any).mid ?? null, high: (r as any).high ?? null,
            grossMarket: (r as any).market?.gross ?? null, grossAntam: (r as any).antam?.gross ?? null,
            netMarket: (r as any).market?.net ?? null, netAntam: (r as any).antam?.net ?? null,
            occ: (r as any).market?.occupancy ?? null, adr: (r as any).adr ?? null,
            trace: (r as any).trace ?? null,
            ltr, rentFactor: st.loc === "jinde" ? 1 : ctvrtRentFactor(st.loc, st.ctvrt),
          });
        }
  return rows;
}

describe("verejna vstupni mnozina", () => {
  it("odvodi se z behu a zapise baseline", () => {
    const states = locationStates();
    const rows = population();
    const out = process.env.BASELINE_OUT;
    if (out) { mkdirSync("tools", { recursive: true }); writeFileSync(out, JSON.stringify(rows, null, 0)); }
    // eslint-disable-next-line no-console
    console.log(`STAVU lokalita×ctvrt: ${states.length}   KOMBINACI: ${rows.length}`);
    console.log(states.map((s) => `${s.loc}/${s.ctvrt === undefined ? "?" : s.ctvrt ?? "-"}`).join(" "));
    expect(rows.length).toBe(states.length * SIZES.length * 4 * SEASONS.length);
  });
});
