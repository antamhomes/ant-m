import { describe, it, expect } from "vitest";
// @ts-expect-error - .mjs skript bez typu
import { extractFromResponse } from "../../scripts/pl-raw.mjs";

const W = ["2025_08","2025_09","2025_10","2025_11","2025_12","2026_01",
           "2026_02","2026_03","2026_04","2026_05","2026_06","2026_07"];
const row = (month: string, n: number) => ({
  month, occupancy_pct: n, adr: n, revpar: n, active_listings: n, avg_revenue: n,
});
const resp = (months: string[]) => ({ data: months.map((m, i) => row(m, i + 1)) });

/**
 * Vinohrady 2BR, 2. 9. 2026: PriceLabs vrátil 13 měsíců včetně neuzavřeného
 * 2026_08. Okno určuje pullWindow() PŘEDEM, takže vyřazení měsíce mimo něj
 * je aplikace pravidla. Vyřazení podle toho, jestli řádek „vypadá nedojetě“,
 * by pravidlo naopak zrušilo — proto rozhoduje jen pozice v kalendáři.
 */
describe("okno: nadmnozina se orizne, dira nikdy", () => {
  it("presne pozadovane okno projde bez vyrazeni", () => {
    const r = extractFromResponse(resp(W), W);
    expect(r.excluded).toHaveLength(0);
    expect(r.values.adr).toHaveLength(12);
  });

  it("13 mesicu vcetne 2026_08: artefakt bere 12, raw si nechava vse", () => {
    const full = [...W, "2026_08"];
    const r = extractFromResponse(resp(full), W);
    expect(r.values.adr).toHaveLength(12);
    expect(r.values.adr[11]).toBe(12);              // 2026_07, ne srpnova hodnota
    expect(r.excluded).toHaveLength(1);
    expect(r.excluded[0].month).toBe("2026_08");
    expect(r.excluded[0].reason).toContain("mimo pozadovane okno");
  });

  it("chybejici 2026_06 je TVRDY FAIL, ne tise doplneny", () => {
    const holed = W.filter((m) => m !== "2026_06");
    expect(() => extractFromResponse(resp(holed), W)).toThrow(/chybi pozadovany mesic 2026_06/);
  });

  it("zdvojeny pozadovany mesic je tvrdy fail", () => {
    expect(() => extractFromResponse(resp([...W, "2026_03"]), W)).toThrow(/2026_03 je v odpovedi 2x/);
  });

  it("mesic navic UVNITR okna je tvrdy fail", () => {
    const inside = [...W];
    inside.splice(3, 0, "2025_11b");
    expect(() => extractFromResponse(resp(inside), W)).toThrow(/lezi UVNITR okna/);
  });

  it("mesic pred oknem se vyradi stejne jako mesic za nim", () => {
    const r = extractFromResponse(resp(["2025_07", ...W]), W);
    expect(r.excluded.map((e: any) => e.month)).toEqual(["2025_07"]);
    expect(r.values.adr[0]).toBe(2);                // 2025_08 je druhy radek
  });
});
