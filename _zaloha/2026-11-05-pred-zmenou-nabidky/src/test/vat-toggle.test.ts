import { describe, it, expect } from "vitest";
import { ownerMonthly, MGMT_FEE, MGMT_FEE_GROSS } from "@/lib/yield";

describe("přepínač plátce DPH (3. 11. 2026)", () => {
  it("plátce DPH nese 20 %, ostatní 24,2 %; tržby, provize ani faktor se nemění", () => {
    const a = ownerMonthly("praha1", "2kk", { m2: 52 });
    const b = ownerMonthly("praha1", "2kk", { m2: 52, vatPayer: true });
    if (!a.supported || !b.supported) throw new Error("praha1 musí být podporovaná");
    expect(b.antam.gross).toBe(a.antam.gross);
    expect(b.antam.netRevenue).toBe(a.antam.netRevenue);
    expect(b.trace.factor).toBe(a.trace.factor);
    expect(b.antam.mgmt).toBe(Math.round(a.antam.netRevenue * MGMT_FEE));
    expect(a.antam.mgmt).toBe(Math.round(a.antam.netRevenue * MGMT_FEE_GROSS));
    expect(b.high).toBeGreaterThan(a.high);
    // +5,5 % pro majitele: (1 − 0,20) / (1 − 0,242)
    expect(b.high / a.high).toBeCloseTo((1 - MGMT_FEE) / (1 - MGMT_FEE_GROSS), 2);
  });
  it("výchozí volání se nemění (veřejné číslo bez přepínače zůstává)", () => {
    const a = ownerMonthly("praha3", "2kk");
    const b = ownerMonthly("praha3", "2kk", { vatPayer: false });
    expect(b).toEqual(a);
  });
});
