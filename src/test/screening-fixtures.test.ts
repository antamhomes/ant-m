/**
 * Golden fixtures vyhodnocovače (invariant I6). Deset reprezentativních bytů
 * napříč zelenou, žlutou i červenou, včetně dopočtené buňky a okresu bez
 * měření. Když se čísla pohnou, musí se to stát VĚDOMĚ: buď se změnil model
 * (nová CALC_MODEL_VERSION), nebo se rozbil screening.
 */
import { it, expect, describe } from "vitest";
import { screen } from "@/lib/screening";
import { locationStates, SIZES } from "./population";
import { bucketsFor, type LocationKey, type SizeKey } from "@/lib/yield";
const C: [string, LocationKey, string | null, SizeKey, number][] = [
  ["Staré Město 2+kk 60", "praha1", "praha1/stare_mesto", "2kk", 60],
  ["Nové Město 1+kk 34", "praha1", "praha1/nove_mesto", "1kk", 34],
  ["Vinohrady 2+kk 58", "praha2", "praha2/vinohrady", "2kk", 58],
  ["Praha 2 ostatní 3+kk 90", "praha2", null, "3kk", 90],
  ["Žižkov 2+kk 55", "praha3", "praha3/zizkov", "2kk", 55],
  ["Praha 4 ostatní 2+kk 50", "praha4", null, "2kk", 50],
  ["Smíchov 1+kk 35", "praha5", "praha5/smichov", "1kk", 35],
  ["Karlín 2+kk 53", "praha8", "praha8/karlin", "2kk", 53],
  ["Praha 9 ostatní 1+kk 35", "praha9", null, "1kk", 35],
  ["Praha 10 ostatní 4+kk 115", "praha10", null, "4kk", 115],
];
describe("golden fixtures", () => {
 it("tisk pro report", () => {
  console.log("\n" + C.map(([name, d, c, s, m]) => {
    const r = screen({ addressRaw: "", district: d, ctvrt: c, size: s, m2: m });
    return [name.padEnd(26), String(r.verdict).padEnd(10), String(r.verdictReason ?? "-").padEnd(16),
      ("base " + r.screeningBaseline).padEnd(12), ("pub " + r.publicMonthly).padEnd(11),
      ("floor " + r.floorMonthly).padEnd(12), ("buf " + (r.bufferPct === null ? "-" : Math.round(r.bufferPct * 100) + "%")).padEnd(10),
      r.band.padEnd(4), ("der " + r.cellDerived).padEnd(10), ("n " + r.nMin).padEnd(7),
      ("f " + r.operatorFactorUsed).padEnd(8), r.confidence].join("");
  }).join("\n"));
  // rozdělení verdiktů přes celý vstupní prostor
  const tally = { worth: 0, review: 0, not_worth: 0 };
  let n = 0;
  for (const st of locationStates()) {
    if (st.loc === "jinde") continue;
    for (const size of SIZES) for (const b of bucketsFor(size)) {
      if (b.representativeM2 === null) continue;
      const r = screen({ addressRaw: "", district: st.loc as LocationKey, ctvrt: st.ctvrt ?? null, size, m2: b.representativeM2 });
      tally[r.verdict]++; n++;
    }
  }
  console.log(`\nROZDĚLENÍ přes ${n} kombinací: zelená ${Math.round(tally.worth/n*100)} % · žlutá ${Math.round(tally.review/n*100)} % · červená ${Math.round(tally.not_worth/n*100)} %`);
 });

 it("drží zamčené hodnoty", () => {
  const g = (d: LocationKey, c: string | null, s: SizeKey, m: number) =>
    screen({ addressRaw: "", district: d, ctvrt: c, size: s, m2: m });

  const stareMesto = g("praha1", "praha1/stare_mesto", "2kk", 60);
  expect(stareMesto.verdict).toBe("worth");
  expect(stareMesto.screeningBaseline).toBe(47073);
  expect(stareMesto.floorMonthly).toBe(34606);
  expect(stareMesto.operatorFactorUsed).toBe(1.032);
  expect(stareMesto.confidence).toBe("high");

  const vinohrady = g("praha2", "praha2/vinohrady", "2kk", 58);
  expect(vinohrady.verdict).toBe("review");
  expect(vinohrady.verdictReason).toBe("marginal_spread");
  expect(vinohrady.operatorFactorUsed).toBe(1);
  expect(vinohrady.operatorMeasured).toBe(false);

  const zizkov = g("praha3", "praha3/zizkov", "2kk", 55);
  expect(zizkov.operatorFactorUsed).toBe(1.105);

  const p4 = g("praha4", null, "2kk", 50);
  expect(p4.verdict).toBe("not_worth");
  expect(p4.bufferPct).toBeLessThan(0.1);

  const p10 = g("praha10", null, "4kk", 115);
  expect(p10.cellDerived).toBe(true);
  expect(p10.confidence).toBe("low");
  expect(p10.verdict).not.toBe("worth");

  // screening je vždy pod veřejným číslem
  for (const r of [stareMesto, vinohrady, zizkov, p4, p10]) {
    expect(r.screeningBaseline!).toBeLessThanOrEqual(r.publicMonthly!);
  }
 });
});
