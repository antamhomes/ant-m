import { describe, it, expect } from "vitest";
import { classifyBand, BAND_RULE, leadSummaryLine, calcEchoLabel, type LeadCalcPayload } from "@/lib/leadBand";
import { ownerMonthly, rentFor, bucketsFor, ctvrtiOf, CALC_MODEL_VERSION } from "@/lib/yield";
import { CALC_DATA_WINDOW, dataWindowLabel } from "@/lib/dataWindow";

/**
 * PÁSMO POPTÁVKY je prezentace a interní skórování, ne ekonomika: počítá se
 * nad owner_high a nájmem, které karta stejně ukazuje. Tyhle testy hlídají
 * hranice pravidla (spec §3), výjimku 1kk·l a čitelný souhrn do e-mailu.
 */
const base = { supported: true, oversized: false, size: "2kk" as const, bucket: "m" };

describe("classifyBand: hranice pravidla", () => {
  it("ratio 1,7 je strong, těsně pod ním viable", () => {
    expect(classifyBand({ ...base, ownerHigh: 17000, ltrMonth: 10000 }).band).toBe("strong");
    expect(classifyBand({ ...base, ownerHigh: 16999, ltrMonth: 10000 }).band).toBe("viable");
    expect(BAND_RULE.strongMin).toBe(1.7);
  });

  it("ratio 1,3 je viable, těsně pod ním weak (při malém ročním rozdílu)", () => {
    expect(classifyBand({ ...base, ownerHigh: 13000, ltrMonth: 10000 }).band).toBe("viable");
    // 12 999 − 10 000 = 2 999/měs → 35 988/rok < 100 000 → weak
    expect(classifyBand({ ...base, ownerHigh: 12999, ltrMonth: 10000 }).band).toBe("weak");
    expect(BAND_RULE.viableMin).toBe(1.3);
  });

  it("pod 1,3× drží byt v viable roční rozdíl ≥ 100 000 Kč", () => {
    // 1,25× při nájmu 40 000: rozdíl 10 000/měs = 120 000/rok → viable
    const r = classifyBand({ ...base, ownerHigh: 50000, ltrMonth: 40000 });
    expect(r.band).toBe("viable");
    expect(r.annualDelta).toBe(120000);
    // 1,25× při nájmu 20 000: rozdíl 5 000/měs = 60 000/rok → weak
    expect(classifyBand({ ...base, ownerHigh: 25000, ltrMonth: 20000 }).band).toBe("weak");
    expect(BAND_RULE.viableDeltaYearMin).toBe(100_000);
  });

  it("1kk·l není nikdy weak (známé omezení kapacity 1+kk), ostatní kbelíky 1kk ano", () => {
    const weakNumbers = { ownerHigh: 21000, ltrMonth: 19000 }; // 1,105×, +24 000/rok
    expect(classifyBand({ ...base, ...weakNumbers, size: "1kk", bucket: "l" }).band).toBe("viable");
    expect(classifyBand({ ...base, ...weakNumbers, size: "1kk", bucket: "m" }).band).toBe("weak");
    expect(classifyBand({ ...base, ...weakNumbers, size: "2kk", bucket: "l" }).band).toBe("weak");
    // výjimka nepovyšuje na strong
    expect(classifyBand({ ...base, ownerHigh: 30000, ltrMonth: 19000, size: "1kk", bucket: "l" }).band).toBe("viable");
  });

  it("nepodporované, nadměrné a bez nájmu mají vlastní stav a žádný násobek", () => {
    expect(classifyBand({ ...base, oversized: true, ownerHigh: 50000, ltrMonth: 20000 })).toEqual({ band: "oversized", ratio: null, annualDelta: null });
    expect(classifyBand({ ...base, supported: false, ownerHigh: null, ltrMonth: null })).toEqual({ band: "unsupported", ratio: null, annualDelta: null });
    expect(classifyBand({ ...base, ownerHigh: 30000, ltrMonth: 0 }).band).toBe("none");
  });

  it("ratio a roční rozdíl jsou přesně high/nájem a (high − nájem) × 12", () => {
    const r = classifyBand({ ...base, ownerHigh: 63000, ltrMonth: 32000 });
    expect(r.ratio).toBeCloseTo(63000 / 32000, 10);
    expect(r.annualDelta).toBe((63000 - 32000) * 12);
  });
});

describe("classifyBand na skutečném modelu", () => {
  const m2Of = (size: "1kk" | "2kk" | "3kk" | "4kk", bucket: string) =>
    bucketsFor(size).find((b) => b.id === bucket)!.representativeM2!;
  const bandOf = (loc: "praha1" | "praha4" | "praha6", ctvrt: string | undefined, size: "1kk" | "2kk", bucket: string) => {
    const m2 = m2Of(size, bucket);
    const r = ownerMonthly(loc, size, { season: "year", m2, ctvrt });
    const ltr = rentFor(loc, size, m2, "mix", ctvrt);
    return classifyBand({ supported: r.supported, oversized: false, ownerHigh: r.supported ? r.high : null, ltrMonth: ltr, size, bucket });
  };

  it("Staré Město 2+kk běžný je strong, Praha 4 Ostatní 2+kk běžný je weak (audit, 7. 9. 2026)", () => {
    expect(ctvrtiOf("praha1").map((c) => c.id)).toContain("stare_mesto");
    expect(bandOf("praha1", "stare_mesto", "2kk", "m").band).toBe("strong");
    expect(bandOf("praha4", undefined, "2kk", "m").band).toBe("weak");
  });

  it("1kk Větší v Praze 6 je viable jen díky výjimce (bez ní by byl weak)", () => {
    const r = bandOf("praha6", undefined, "1kk", "l");
    expect(r.ratio!).toBeLessThan(BAND_RULE.viableMin);
    expect(r.annualDelta!).toBeLessThan(BAND_RULE.viableDeltaYearMin);
    expect(r.band).toBe("viable");
  });
});

describe("čitelný souhrn do poptávky", () => {
  const payload: LeadCalcPayload = {
    model_version: CALC_MODEL_VERSION,
    data_window: { from: CALC_DATA_WINDOW.from, to: CALC_DATA_WINDOW.to, months: CALC_DATA_WINDOW.months },
    district: "praha1", district_label: "Praha 1",
    ctvrt: "stare_mesto", ctvrt_label: "Staré Město",
    dispozice: "2kk", size_label: "2+kk",
    size_bucket_id: "l", bucket_label: "Větší (56–80 m²)",
    representative_m2: 63, oversized: false, season: "year",
    owner_low: 58000, owner_high: 63412, ltr_month: 32000, ltr_ctvrt_factor: 1.1,
    derived: false, result_band: "strong", ratio: 63412 / 32000, annual_delta: (63412 - 32000) * 12,
  };

  it("řádek do e-mailu nese popisky, číslo, nájem, násobek, rozdíl, pásmo, verzi a okno dat", () => {
    const line = leadSummaryLine(payload);
    expect(line.startsWith("Kalkulačka: Praha 1 · Staré Město · 2+kk · kolem 63 m²")).toBe(true);
    expect(line).toContain("~63 000 Kč/měs");
    expect(line).toContain("nájem 32 000 Kč");
    expect(line).toContain("1,98× nájem");
    expect(line).toContain("+376 944 Kč/rok");
    expect(line).toContain("pásmo: strong");
    expect(line).toContain(`model ${CALC_MODEL_VERSION}`);
    expect(line).toContain("data 12 měsíců do 7/2026");
    expect(line).not.toMatch(/praha1|stare_mesto/);
    // žádné nezlomitelné mezery: e-mail není web
    expect(line).not.toContain("\u00a0");
  });

  it("derived a sezóna se do řádku propíšou, nepodporovaný byt má pásmo a bez čísel", () => {
    expect(leadSummaryLine({ ...payload, derived: true, season: "xmas" })).toMatch(/sezóna xmas.*odvozené číslo/);
    const uns = leadSummaryLine({ ...payload, district: "jinde", district_label: "Jinde / mimo Prahu", ctvrt: null, ctvrt_label: null, owner_low: null, owner_high: null, ltr_month: null, ratio: null, annual_delta: null, result_band: "unsupported" });
    expect(uns).toContain("Jinde / mimo Prahu · 2+kk");
    expect(uns).toContain("pásmo: unsupported");
    expect(uns).not.toContain("Kč/měs");
  });

  it("řádek ve formuláři říká jen to, co majitel viděl: lokalita, dispozice, plocha, číslo", () => {
    const cs = calcEchoLabel(payload, "cs");
    expect(cs).toBe("Praha 1 · Staré Město · 2+kk · kolem 63\u00a0m² · ~63\u00a0000\u00a0Kč / měsíc");
    expect(cs).not.toMatch(/strong|1,98|pásmo/);
    expect(calcEchoLabel(payload, "vi")).toBe("Praha 1 · Staré Město · 2+kk · khoảng 63\u00a0m² · ~63\u00a0000\u00a0Kč / tháng");
    // starý snapshot bez popisků nespadne
    expect(calcEchoLabel({ district: "praha1", ctvrt: "stare_mesto" }, "cs")).toBe("");
  });

  it("popis okna dat se skládá z konstanty, ne z překladů", () => {
    expect(dataWindowLabel("cs")).toBe("12 měsíců do 7/2026");
    expect(dataWindowLabel("vi")).toBe("12 tháng đến 7/2026");
    expect(CALC_DATA_WINDOW.modelVersion).toBe(CALC_MODEL_VERSION);
  });
});
