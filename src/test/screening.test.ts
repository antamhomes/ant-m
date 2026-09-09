/**
 * Invarianty vyhodnocovače (docs/underwriting-mvp-spec.md §9).
 * I1 a I2 chrání solventnost, ne UX: interní faktor bez měření nesmí nést
 * nezměřený příplatek a screeningové číslo nesmí nikde přerůst veřejné.
 */
import { describe, it, expect } from "vitest";
import {
  OPERATOR_EVIDENCE, OPERATOR_FACTOR_INTERNAL, OPERATOR_FACTOR_PUBLIC,
  OPERATOR_FACTOR_DEFAULT, OPERATOR_FACTOR_DEFAULT_PUBLIC,
  internalFactorFrom, publicFactorFrom, operatorFactor,
  isMeasured, ctvrtiOf, typicalArea, bandFor,
  type LocationKey, type SizeKey,
} from "@/lib/yield";
import { screen, WORTH_MIN, REVIEW_MIN } from "@/lib/screening";
import { locationStates, SIZES as POP_SIZES } from "./population";
import { bucketsFor } from "@/lib/yield";

/** Vstupní prostor vyhodnocovače: okres × čtvrť × dispozice × kbelík plochy.
 *  Sezóna se sem nepromítá, screening jede vždy na ročním průměru. */
type Case = { district: LocationKey; ctvrt: string | null; size: SizeKey; m2: number; id: string };
const CASES: Case[] = (() => {
  const out: Case[] = [];
  for (const st of locationStates()) {
    if (st.loc === "jinde") continue;
    for (const size of POP_SIZES)
      for (const b of bucketsFor(size)) {
        if (b.representativeM2 === null) continue;
        out.push({
          district: st.loc as LocationKey, ctvrt: st.ctvrt ?? null,
          size, m2: b.representativeM2,
          id: `${st.loc}|${st.ctvrt ?? "-"}|${size}|${b.id}`,
        });
      }
  }
  return out;
})();

const DISTRICTS: LocationKey[] = [
  "praha1", "praha2", "praha3", "praha4", "praha5",
  "praha6", "praha7", "praha8", "praha9", "praha10",
];
const SIZES: SizeKey[] = ["1kk", "2kk", "3kk", "4kk"];

describe("I1 · interní operátorský faktor", () => {
  it("výchozí interní je 1,00, veřejný 1,10", () => {
    expect(OPERATOR_FACTOR_DEFAULT).toBe(1.0);
    expect(OPERATOR_FACTOR_DEFAULT_PUBLIC).toBe(1.1);
  });

  it("interní NENÍ alias veřejného", () => {
    expect(OPERATOR_FACTOR_INTERNAL).not.toBe(OPERATOR_FACTOR_PUBLIC);
  });

  it("okres bez měření má interně 1,00, ne 1,10", () => {
    for (const d of DISTRICTS) {
      if (OPERATOR_EVIDENCE[d]) continue;
      expect(operatorFactor(d, "internal"), `${d} bez měření`).toBe(1.0);
      expect(operatorFactor(d, "public"), `${d} veřejně`).toBe(1.1);
    }
  });

  it("interní faktor nikde nepřeroste veřejný", () => {
    for (const d of DISTRICTS) {
      expect(operatorFactor(d, "internal"), d).toBeLessThanOrEqual(operatorFactor(d, "public"));
    }
  });

  it("tenký příznivý vzorek se krátí: Praha 3 interně pod veřejným", () => {
    const e = OPERATOR_EVIDENCE.praha3;
    if (!e) return;
    expect(e.weight).toBeLessThan(1);
    expect(operatorFactor("praha3", "internal")).toBeLessThan(operatorFactor("praha3", "public"));
  });

  it("pravidlo drží i pro syntetická měření, včetně těch pod 1,00", () => {
    for (const m of [0.8, 0.9, 0.95, 1.0, 1.032, 1.1, 1.21, 1.5]) {
      for (const w of [0, 0.25, 0.5, 0.75, 1]) {
        expect(internalFactorFrom(m, w), `měřeno ${m}, váha ${w}`)
          .toBeLessThanOrEqual(publicFactorFrom(m, w));
      }
    }
  });
});

describe("I2 · screening nikdy nepřeroste veřejné číslo", () => {
  it("platí pro celou populaci", () => {
    let checked = 0;
    for (const c of CASES) {
      const r = screen({ addressRaw: "", district: c.district, ctvrt: c.ctvrt, size: c.size, m2: c.m2 });
      if (!r.supported || r.publicMonthly === null || r.screeningBaseline === null) continue;
      checked++;
      expect(r.screeningBaseline, c.id)
        .toBeLessThanOrEqual(r.publicMonthly);
    }
    expect(checked).toBeGreaterThan(100);
  });
});

describe("I3 · fáze 1 nikdy nevydá ACCEPT", () => {
  it("verdikt je jen worth / review / not_worth", () => {
    for (const c of CASES) {
      const r = screen({ addressRaw: "", district: c.district, ctvrt: c.ctvrt, size: c.size, m2: c.m2 });
      expect(["worth", "review", "not_worth"]).toContain(r.verdict);
    }
  });
});

describe("I4 · dopočtená buňka ani malý vzorek nedají zelenou", () => {
  it("thin evidence končí nejvýš na review", () => {
    for (const c of CASES) {
      const r = screen({ addressRaw: "", district: c.district, ctvrt: c.ctvrt, size: c.size, m2: c.m2 });
      if (r.verdict !== "worth") continue;
      expect(r.cellDerived, `${c.id} dopočtená a přesto zelená`).toBe(false);
      expect(r.nMin === null || r.nMin >= 50, `${c.id} n=${r.nMin} a přesto zelená`).toBe(true);
    }
  });

  it("nepodporovaná lokalita nikdy nedá zelenou", () => {
    const r = screen({ addressRaw: "", district: "praha10" as LocationKey, ctvrt: null, size: "4kk", m2: 200 });
    expect(r.verdict).not.toBe("worth");
  });
});

describe("I6 · determinismus", () => {
  it("stejný vstup dá bit po bitu stejný výstup", () => {
    const input = { addressRaw: "Vinohradská 123", district: "praha2" as LocationKey, ctvrt: "praha2/vinohrady", size: "2kk" as SizeKey, m2: 58 };
    expect(JSON.stringify(screen(input))).toBe(JSON.stringify(screen(input)));
  });

  it("adresa jako text výsledek nemění", () => {
    const a = screen({ addressRaw: "Vinohradská 123", district: "praha2", ctvrt: null, size: "2kk", m2: 58 });
    const b = screen({ addressRaw: "úplně jiný text", district: "praha2", ctvrt: null, size: "2kk", m2: 58 });
    expect(JSON.stringify({ ...a, why: "" })).toBe(JSON.stringify({ ...b, why: "" }));
  });

  it("současný nájem do verdiktu nevstupuje", () => {
    const a = screen({ addressRaw: "", district: "praha3", ctvrt: null, size: "2kk", m2: 55 });
    const b = screen({ addressRaw: "", district: "praha3", ctvrt: null, size: "2kk", m2: 55, currentRent: 99000 });
    expect(a.verdict).toBe(b.verdict);
    expect(a.bufferPct).toBe(b.bufferPct);
  });
});

describe("I9 · žádný address-level uplift bez ruční úpravy", () => {
  it("screening baseline stojí jen na okresu, čtvrti, dispozici a m²", () => {
    const r = screen({ addressRaw: "Penthouse s terasou a výhledem", district: "praha1", ctvrt: null, size: "2kk", m2: 60 });
    const s = screen({ addressRaw: "suterén bez oken", district: "praha1", ctvrt: null, size: "2kk", m2: 60 });
    expect(r.screeningBaseline).toBe(s.screeningBaseline);
  });
});

describe("zadaná kapacita: interní cesta modelu, ne nová logika", () => {
  it("bez kapacity se pásmo hádá, se zadanou je pozorované", () => {
    const base = { addressRaw: "", district: "praha2" as LocationKey, ctvrt: null, size: "2kk" as SizeKey, m2: 58 };
    expect(screen(base).capacitySource).toBe("inferred");
    expect(screen({ ...base, sleeps: 6 }).capacitySource).toBe("observed");
  });

  it("mapování kapacity na pásmo je bandFor z modelu, ne vlastní tabulka", () => {
    const base = { addressRaw: "", district: "praha1" as LocationKey, ctvrt: null, size: "2kk" as SizeKey, m2: 55 };
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 12]) {
      const r = screen({ ...base, sleeps: n });
      if (r.supported) expect(r.band, `kapacita ${n}`).toBe(bandFor(n));
    }
  });

  it("hýbe to OBĚMA směry: 2+kk pro čtyři spadne pod dohad", () => {
    const base = { addressRaw: "", district: "praha2" as LocationKey, ctvrt: "praha2/vinohrady", size: "2kk" as SizeKey, m2: 58 };
    const inferred = screen(base);
    const four = screen({ ...base, sleeps: 4 });
    const six = screen({ ...base, sleeps: 6 });
    expect(four.screeningBaseline!).toBeLessThan(inferred.screeningBaseline!);
    expect(six.screeningBaseline!).toBeGreaterThan(four.screeningBaseline!);
  });

  it("HRANICE MODELU: u 1+kk do čtyř hostů kapacita výsledkem nehne", () => {
    const base = { addressRaw: "", district: "praha1" as LocationKey, ctvrt: "praha1/nove_mesto", size: "1kk" as SizeKey, m2: 22 };
    const two = screen({ ...base, sleeps: 2 });
    const four = screen({ ...base, sleeps: 4 });
    // Trh nemá pásmo pod 1BR, takže tohle NENÍ chyba testu, ale mez modelu.
    expect(two.screeningBaseline).toBe(four.screeningBaseline);
    expect(two.band).toBe("1BR");
  });

  it("GUARD: nevyřešená kapacita nikdy nedá zelenou ani vysokou jistotu", () => {
    const studio = { addressRaw: "", district: "praha1" as LocationKey, ctvrt: "praha1/nove_mesto", size: "1kk" as SizeKey, m2: 22 };
    // 98% rezerva, měřená buňka, n=1606, měřený faktor: bez guardu by to byla zelená.
    const two = screen({ ...studio, sleeps: 2 });
    expect(two.bufferPct!).toBeGreaterThan(WORTH_MIN);
    expect(two.cellDerived).toBe(false);
    expect(two.capacityResolved).toBe(false);
    expect(two.verdict).not.toBe("worth");
    expect(two.verdictReason).toBe("thin_evidence");
    expect(two.confidence).not.toBe("high");

    // 1+kk bez zadané kapacity je taky nevyřešené: model si dosadí čtyři.
    const unknown = screen(studio);
    expect(unknown.capacityResolved).toBe(false);
    expect(unknown.verdict).not.toBe("worth");

    // Zadané „spí 4" u 1+kk je vršek pásma, tam model sedí.
    expect(screen({ ...studio, sleeps: 4 }).capacityResolved).toBe(true);
    // 2+kk bez kapacity se hádá z m², ale uvnitř pásma to není mimo rozlišení.
    expect(screen({ addressRaw: "", district: "praha2", ctvrt: null, size: "2kk", m2: 58 }).capacityResolved).toBe(true);
  });

  it("sezóna se propisuje do výsledku", () => {
    const base = { addressRaw: "", district: "praha1" as LocationKey, ctvrt: null, size: "2kk" as SizeKey, m2: 55 };
    const year = screen(base);
    const xmas = screen({ ...base, season: "xmas" as const });
    expect(year.season).toBe("year");
    expect(xmas.season).toBe("xmas");
    expect(xmas.screeningBaseline!).toBeGreaterThan(year.screeningBaseline!);
  });
});

describe("prahy a rozpad žluté", () => {
  it("prahy jsou v0 hodnoty ze specu", () => {
    expect(WORTH_MIN).toBe(0.35);
    expect(REVIEW_MIN).toBe(0.1);
  });

  it("verdictReason je vyplněný právě u žluté", () => {
    for (const c of CASES) {
      const r = screen({ addressRaw: "", district: c.district, ctvrt: c.ctvrt, size: c.size, m2: c.m2 });
      if (r.verdict === "review") expect(r.verdictReason).not.toBeNull();
      else expect(r.verdictReason).toBeNull();
    }
  });

  it("marginal_spread znamená rezervu mezi prahy, thin_evidence nad horním prahem", () => {
    for (const c of CASES) {
      const r = screen({ addressRaw: "", district: c.district, ctvrt: c.ctvrt, size: c.size, m2: c.m2 });
      if (!r.supported || r.bufferPct === null) continue;
      if (r.verdictReason === "marginal_spread") {
        expect(r.bufferPct).toBeGreaterThanOrEqual(REVIEW_MIN);
        expect(r.bufferPct).toBeLessThan(WORTH_MIN);
      }
      if (r.verdictReason === "thin_evidence" && r.supported) {
        expect(r.bufferPct).toBeGreaterThanOrEqual(WORTH_MIN);
      }
    }
  });
});

describe("veřejná populace se nezměnila", () => {
  it("čtvrti a typické plochy zůstávají", () => {
    expect(ctvrtiOf("praha2").length).toBeGreaterThan(0);
    expect(typicalArea("praha1", "2kk")).toBe(65);
    expect(isMeasured("praha1")).toBe(true);
  });
});
