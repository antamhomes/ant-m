/**
 * FAKTA — pojistka proti tichému rozjetí čísel.
 *
 * Každé číslo, které majitel na webu uvidí, musí souhlasit se smlouvou, s VOP,
 * s prezentací a s portálem. Historicky se to rozešlo: web účtoval 28 %, zatímco
 * smlouva i VOP na stejné doméně říkaly 25 %. Tenhle test takovou změnu zastaví
 * dřív, než se dostane k majiteli.
 *
 * Když test spadne, NEopravuj ho, aby prošel. Buď je změna omyl a patří zpět,
 * nebo je záměrná a pak se mění na VŠECH místech naráz: translations.ts (cs+vi),
 * src/lib/yield.ts, src/lib/mcp/tools/*, VOP (make_legal.py), smlouva, prezentace
 * a portál. Teprve potom se přepíše hodnota tady.
 */
import { describe, it, expect } from "vitest";
import translations from "@/i18n/translations";
import { DISTRICTS, BASE_ADR, LTR, ENERGY, MGMT_FEE, PLATFORM_FEE, LAUNCH_FEE, ownerMonthly } from "@/lib/yield";

const cs = translations.cs as Record<string, string>;
const vi = translations.vi as Record<string, string>;
const strip = (s: string) => s.replace(/ /g, " ");

describe("odměna za správu", () => {
  it("je 30 % v modelu", () => {
    expect(MGMT_FEE).toBe(0.30);
  });

  it("je 30 % všude v české i vietnamské kopii", () => {
    expect(strip(cs.pr1_price)).toMatch(/30 %/);
    expect(strip(vi.pr1_price)).toMatch(/30 %/);
    for (const key of ["calc_net_sub", "calc_excluded_note", "faq5_a", "faq9_a", "report_row_costs"]) {
      expect(strip(cs[key]), `cs.${key}`).toMatch(/30\s?%/);
      expect(strip(vi[key]), `vi.${key}`).toMatch(/30\s?%/);
    }
  });

  it("nikde nezůstalo staré 25 %, 28 % ani dělení 75/25", () => {
    for (const [lang, dict] of [["cs", cs], ["vi", vi]] as const) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== "string") continue;
        const v = strip(value);
        // 25 000 Kč (uvedení do provozu) je jiné číslo a zůstává
        expect(v.replace(/25 000/g, ""), `${lang}.${key}`).not.toMatch(/25\s?%/);
        expect(v, `${lang}.${key}`).not.toMatch(/28\s?%/);
        expect(v, `${lang}.${key}`).not.toMatch(/75\s?\/\s?25/);
      }
    }
  });

  it("dělí čistý výnos 70/30", () => {
    expect(strip(cs.calc_split_aria)).toBe("70 % majitel, 30 % Antam Homes");
    expect(strip(vi.calc_split_aria)).toBe("70% chủ nhà, 30% Antam Homes");
    expect(strip(cs.calc_method_note)).toMatch(/70\/30/);
    expect(strip(vi.calc_method_note)).toMatch(/70\/30/);
  });

  it("DPH z provize platformy nezatěžuje majitele: v modelu ani v kopii", () => {
    // Od přechodu na 30 % ji hradí Antam ze své odměny. Kdyby se vrátila do
    // výpočtu, majitel by platil dvakrát: nižším podílem i vyšší sazbou.
    expect(strip(cs.calc_method_note)).toMatch(/ze své odměny|neodečítá|nevstupuje/);
    expect(strip(cs.pr1_note)).toMatch(/DPH z provize/);
  });

  it("provize v modelu odpovídá měřenému pásmu 17–21 %", () => {
    // Změřeno 27. 8. 2026 na 7 bytech; jedna sazba to nevystihne, 0,17 je střed.
    expect(PLATFORM_FEE).toBeGreaterThanOrEqual(0.15);
    expect(PLATFORM_FEE).toBeLessThanOrEqual(0.21);
  });

  it("je konečná a netvrdí, že se k ní účtuje DPH", () => {
    // Jako identifikovaná osoba Antam DPH z odměny neúčtuje; čl. 8.2 smlouvy
    // mluví o konečné ceně. „Včetně DPH" popisuje něco, co se neděje.
    expect(strip(cs.pr1_note)).toMatch(/[Kk]onečná/);
    expect(strip(cs.pr1_note)).not.toMatch(/včetně DPH/i);
    expect(strip(cs.faq5_a)).not.toMatch(/konečná včetně DPH/i);
  });
});

describe("ceník", () => {
  it("uvedení do provozu stojí 25 000 Kč a stejné číslo je v kopii", () => {
    expect(LAUNCH_FEE).toBe(25000);
    expect(strip(cs.pr2_price)).toMatch(/25 000 Kč/);
    expect(strip(cs.faq16_a)).toMatch(/25 000/);
    expect(strip(vi.faq16_a)).toMatch(/25 000/);
  });

  it("řízení projektu je 20 % a platí až nad 30 000 Kč", () => {
    expect(strip(cs.pr4_price)).toMatch(/20 %/);
    expect(strip(cs.pr4_note)).toMatch(/30 000/);
    expect(strip(vi.pr4_note)).toMatch(/30 000/);
  });

  it("drobné opravy: 5 000 Kč na případ, nejvýše 20 000 Kč za rok", () => {
    expect(strip(cs.faq5_a)).toMatch(/5 000 Kč/);
    expect(strip(cs.faq5_a)).toMatch(/20 000 Kč za rok/);
    expect(strip(vi.faq5_a)).toMatch(/5 000 Kč/);
    expect(strip(vi.faq5_a)).toMatch(/20 000 Kč/);
  });

  it("netvrdí, že vstupní poplatky neexistují", () => {
    for (const dict of [cs, vi]) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== "string") continue;
        expect(strip(value).toLowerCase(), key).not.toMatch(/žádné vstupní poplatky|không có phí vào/);
      }
    }
  });
});

describe("garance výnosu", () => {
  it("je na webu popsaná v obou jazycích", () => {
    expect(cs.g_desc).toBeTruthy();
    expect(vi.g_desc).toBeTruthy();
    expect(strip(cs.g_desc)).toMatch(/nájem/);
    expect(strip(cs.g_desc)).toMatch(/energie/);
    expect(strip(cs.faq18_a)).toMatch(/nájem/);
    expect(strip(cs.faq18_a)).toMatch(/energie/);
  });

  it("hero teaser sedí s kartami portfolia (53/61 tis., Praha 1)", () => {
    expect(strip(cs.hero_extra)).toMatch(/53 000/);
    expect(strip(cs.hero_extra)).toMatch(/61 000/);
    expect(strip(cs.hero_extra)).toMatch(/Praha 1/);
    expect(strip(vi.hero_extra)).toMatch(/53 000/);
    expect(strip(vi.hero_extra)).toMatch(/61 000/);
  });

  it("ilustrační trojice v garanci sedí s kalkulačkou", () => {
    // Minimum = nájem + energie pro Prahu 1 2+kk; očekávaný výnos = co dá kalkulačka.
    expect(LTR.praha1["2kk"] + ENERGY["2kk"]).toBe(31500);
    expect(strip(cs.g_num2_value)).toMatch(/31 500/);
    const model = ownerMonthly("praha1", "2kk").net;
    expect(Math.round(model / 1000) * 1000).toBe(50000);
    expect(strip(cs.g_num3_value)).toMatch(/50 000/);
  });

  it("jedna pojmenovaná nabídka: hero, kalkulačka i garance vedou na stejný propočet", () => {
    expect(cs.hero_cta).toBe(cs.calc_cta);
    expect(cs.hero_cta).toBe(cs.g_cta);
    expect(vi.hero_cta).toBe(vi.calc_cta);
    expect(vi.hero_cta).toBe(vi.g_cta);
  });

  it("nikde neslibuje garanci z kalkulačky", () => {
    // Kalkulačka je odhad. Garance vzniká až písemným ujednáním pro konkrétní byt.
    expect(strip(cs.calc_disclaimer)).toMatch(/[Gg]arance výnosu vzniká až/);
    expect(strip(vi.calc_disclaimer)).toMatch(/[Cc]am kết doanh thu chỉ có khi/);
  });

  it("blokace: 14 nocí zdarma, dál poměrná úprava", () => {
    expect(strip(cs.faq3_a)).toMatch(/14 nocí/);
    expect(strip(vi.faq3_a)).toMatch(/14 đêm/);
  });
});

describe("výplata a vyúčtování", () => {
  it("slibuje 15. den, jak stanoví čl. 9.3 smlouvy", () => {
    expect(strip(cs.assure4)).toMatch(/15/);
    expect(strip(cs.faq4_a)).toMatch(/15\. dne/);
    expect(strip(vi.faq4_a)).toMatch(/ngày 15/);
  });
});

describe("model výnosu", () => {
  it("drží kalibraci z 27. 8. 2026", () => {
    expect(DISTRICTS.praha1).toEqual({ multiplier: 1.20, occupancy: 0.88 });
    expect(DISTRICTS.praha4).toEqual({ multiplier: 1.02, occupancy: 0.80 });
    expect(DISTRICTS.praha9).toEqual({ multiplier: 0.90, occupancy: 0.76 });
    expect(BASE_ADR).toEqual({ "1kk": 1580, "2kk": 2150, "3kk": 2900, "4kk": 3900 });
  });

  it("nepřeslibuje: Praha 1 2+kk zůstane pod měřenou skutečností bytu 302", () => {
    // Byt 302, Hospitable, 1. 8. 2025 – 31. 7. 2026: majiteli 56 793 Kč měsíčně
    // za dnešních podmínek. Veřejné číslo musí být níž, jinak slibujeme víc,
    // než sami dodáváme.
    // Přepočteno 27. 8. 2026 ze skutečných rezervací na dnešní podmínky
    // (30 %, bez odpočtu DPH z provize, bez poplatku z pobytu).
    const MEASURED_302 = 56793;
    expect(ownerMonthly("praha1", "2kk").net).toBeLessThan(MEASURED_302);
  });

  it("žebřík čtvrtí zůstává stlačený (na krátkodobém pronájmu je rozdíl menší než na nájmu)", () => {
    const mults = Object.values(DISTRICTS).map((d) => d.multiplier);
    expect(Math.max(...mults) / Math.min(...mults)).toBeLessThan(1.4);
  });

  it("nájemní tabulka a energie pokrývají všechny čtvrti a dispozice", () => {
    for (const key of Object.keys(DISTRICTS) as (keyof typeof LTR)[]) {
      for (const size of ["1kk", "2kk", "3kk", "4kk"] as const) {
        expect(LTR[key][size], `${key}.${size}`).toBeGreaterThan(0);
        expect(ENERGY[size]).toBeGreaterThan(0);
      }
    }
  });
});

describe("kopie v obou jazycích", () => {
  it("každý klíč z češtiny existuje i ve vietnamštině", () => {
    const missing = Object.keys(cs).filter((k) => !(k in vi));
    expect(missing).toEqual([]);
  });

  it("neobsahuje pomlčky em dash (čtou se jako AI text)", () => {
    for (const [lang, dict] of [["cs", cs], ["vi", vi]] as const) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== "string") continue;
        expect(value, `${lang}.${key}`).not.toMatch(/—/);
      }
    }
  });
});
