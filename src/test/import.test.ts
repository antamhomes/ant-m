import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error - ciste JS odvozeni sdilene s scripts/pl-import.mjs
import { deriveBands, RELIABLE_MIN_N } from "../../scripts/pl-derive.mjs";
import { MARKET_STR, RELIABLE_MIN_N as MODEL_MIN_N, isReliableN } from "../lib/yield";
// @ts-expect-error - ciste JS pravidlo okna sdilene s pull skripty
import { pullWindow, WINDOW_MONTHS, CLOSE_LAG_DAYS } from "../../scripts/pl-window.mjs";

const DISTRICTS = ["praha1","praha2","praha3","praha4","praha5","praha6","praha7","praha8","praha9"] as const;
const load = (d: string) =>
  JSON.parse(readFileSync(`data/pricelabs-2026-08/${d}.json`, "utf8"));

describe("importni cesta (Step 0)", () => {
  it("okno pullu je deterministicke a sedi na artefakty, ktere uz v repu jsou", () => {
    // Nejsilnejsi test, jaky na tohle jde: pravidlo musi TREFIT okno, na kterem
    // je postaveno vsech devet okresnich artefaktu. Kdyby se rozeslo, indexy
    // nove pullnutych ctvrti by nebyly porovnatelne s okresy.
    const repo = JSON.parse(readFileSync("data/pricelabs-2026-08/praha3.json", "utf8"))
      .meta.months.map((m: string) => m.replace("-", "_"));
    expect(pullWindow(new Date("2026-09-01")).months).toEqual(repo);

    // 10 ctvrti pullnutych 1. 9. 2026 jelo na 2025_09..2026_07 (11 mesicu),
    // tedy na jinem okne nez repo. Tohle pravidlo takovy stav nevyrobi.
    for (const d of ["2026-09-01", "2026-09-30", "2027-02-14", "2026-12-31"]) {
      const w = pullWindow(new Date(d));
      expect(w.months, `${d}: vzdy ${WINDOW_MONTHS} mesicu`).toHaveLength(WINDOW_MONTHS);
      expect(new Set(w.months).size, `${d}: zadny mesic dvakrat`).toBe(WINDOW_MONTHS);
      expect([...w.months].sort(), `${d}: chronologicky`).toEqual(w.months);
      expect(w.from).toBe(w.months[0]);
      expect(w.to).toBe(w.months[WINDOW_MONTHS - 1]);
    }

    // Mesic se pocita za uzavreny az CLOSE_LAG_DAYS po konci: den pred prahem
    // jeste ne, den na prahu uz ano. Zadne koukani do dat, jen kalendar.
    const before = pullWindow(new Date(`2026-09-${String(CLOSE_LAG_DAYS - 1).padStart(2, "0")}`));
    const on = pullWindow(new Date(`2026-09-${String(CLOSE_LAG_DAYS).padStart(2, "0")}`));
    expect(before.to).toBe("2026_07");
    expect(on.to).toBe("2026_08");

    // prelom roku
    expect(pullWindow(new Date("2027-01-15")).months[0]).toBe("2026_01");
    expect(pullWindow(new Date("2027-01-05")).to).toBe("2026_11");
  });

  it("prah spolehlivosti je jedno cislo pro model i import", () => {
    expect(RELIABLE_MIN_N).toBe(MODEL_MIN_N);
  });

  it("odvozuje z artefaktu presne ta n_mean/n_min, ktera jsou v yield.ts", () => {
    for (const d of DISTRICTS) {
      const { usable } = deriveBands(load(d));
      for (const u of usable as Array<{ band: string; nMin: number; nMean: number }>) {
        const cell = (MARKET_STR as Record<string, Record<string, { nMean: number; nMin: number | null }>>)[d]?.[u.band];
        if (!cell) continue;   // pasmo v repu neni (neproslo branou), to je v poradku
        expect(cell.nMin, `${d} ${u.band} nMin`).toBe(u.nMin);
        expect(cell.nMean, `${d} ${u.band} nMean`).toBe(u.nMean);
      }
    }
  });

  it("kazde pouzitelne pasmo nese celou mesicni radu, takze n_min/n_mean jde prepocitat", () => {
    for (const d of DISTRICTS) {
      const { usable } = deriveBands(load(d));
      for (const u of usable as Array<{ band: string; nMin: number; nMean: number; monthly: Record<string, number[]> }>) {
        const series = u.monthly.active_listings;
        expect(series, `${d} ${u.band} rada`).toHaveLength(12);
        expect(Math.min(...series)).toBe(u.nMin);
        expect(Math.round(series.reduce((a, c) => a + c, 0) / series.length)).toBe(u.nMean);
      }
    }
  });

  it("reliable se odvozuje z n_min, nikdy se nebere od volajiciho", () => {
    for (const d of DISTRICTS) {
      for (const u of deriveBands(load(d)).usable as Array<{ nMin: number; reliable: boolean }>) {
        expect(u.reliable).toBe(isReliableN(u.nMin));
      }
    }
  });

  it("pasmo s derou v rade se zahodi, misto aby se podstrelilo", () => {
    const doc = load("praha3");
    doc["2BR"].avg_revenue = doc["2BR"].avg_revenue.slice(0, 9);
    doc["1BR"].active_listings[3] = null;
    const { usable, rejected } = deriveBands(doc);
    expect(usable.map((u: { band: string }) => u.band)).toEqual(["3BR"]);
    expect(rejected.map((r: { band: string }) => r.band).sort()).toEqual(["1BR", "2BR"]);
  });

  it("neznama pasma se ignoruji, ne tise pridavaji", () => {
    const doc = load("praha3");
    doc["5BR"] = doc["3BR"];
    const { unknown, usable } = deriveBands(doc);
    expect(unknown).toEqual(["5BR"]);
    expect(usable.map((u: { band: string }) => u.band)).not.toContain("5BR");
  });
});
