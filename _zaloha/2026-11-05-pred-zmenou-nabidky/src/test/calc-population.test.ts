import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { locationStates, population, SIZES, SEASONS } from "./population";

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
