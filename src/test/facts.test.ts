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
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import translations from "@/i18n/translations";
import {
  DISTRICTS, BASE_ADR, LTR, ENERGY, MGMT_FEE, PLATFORM_FEE, LAUNCH_FEE, ROOMS,
  DAMAGE_COVER_PER_ROOM, DAMAGE_COVER_MAX, annualDamageCover, ownerMonthly,
} from "@/lib/yield";

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
    // Definice minima (nájem + energie) se z českého leadu garance přesunula
    // níž, do řádku ceníku a do FAQ. Test hlídá ten fakt, ne místo, kde stojí.
    for (const key of ["pr6_note", "faq18_a"] as const) {
      expect(strip(cs[key]), `cs.${key}`).toMatch(/nájem/);
      expect(strip(cs[key]), `cs.${key}`).toMatch(/energie/);
    }
    expect(strip(vi.g_desc)).toMatch(/tiền thuê dài hạn/);
    expect(strip(vi.g_desc)).toMatch(/điện nước/);
  });

  it("české hero neukazuje čísla bez kontextu", () => {
    // Copy pass 28. 8. 2026: proof patří do Portfolia, kde je u čísla konkrétní
    // byt, lokalita a násobek nájmu. V heru je headline, jedna věta, jedno
    // tlačítko a pod ním řádek o nezávaznosti. Částky v tisících sem nepatří.
    for (const key of ["hero_desc", "hero_extra"] as const) {
      expect(strip(cs[key]), `cs.${key}`).not.toMatch(/\d{2} \d{3}/);
    }
    expect(strip(cs.hero_desc).split(" ").length).toBeLessThanOrEqual(18);
  });

  it("vietnamské hero teaser drží a sedí s kartami portfolia (56/62 tis.)", () => {
    // Přepočet 28. 8. 2026: 405 vyšlo na 56 000 a 402 na 62 000. Kdyby se karty
    // znovu přepočítaly, musí se s nimi posunout i tenhle teaser.
    expect(strip(vi.hero_extra)).toMatch(/56 000/);
    expect(strip(vi.hero_extra)).toMatch(/62 000/);
  });

  it("karty portfolia a MCP hlásí stejné částky", () => {
    // Čísla žijí na dvou místech: v kartách a v list_portfolio pro MCP. Když se
    // jedno přepočítá a druhé ne, chatbot začne tvrdit něco jiného než web.
    const nums = (src: string, re: RegExp) =>
      [...src.matchAll(re)].map((m) => Number(m[1])).sort((a, b) => a - b);
    const cards = nums(readFileSync("src/components/PortfolioSection.tsx", "utf8"), /owner: (\d+)/g);
    const mcp = nums(readFileSync("src/lib/mcp/tools/list-portfolio.ts", "utf8"), /ownerMonthlyCzk: (\d+)/g);
    expect(cards.length).toBeGreaterThan(0);
    expect(mcp).toEqual(cards);
  });

  it("ilustrační trojice v garanci sedí s kalkulačkou", () => {
    // Minimum = nájem + energie pro Prahu 1 2+kk; očekávaný výnos = co dá kalkulačka.
    expect(LTR.praha1["2kk"] + ENERGY["2kk"]).toBe(31500);
    expect(strip(cs.g_num2_value)).toMatch(/31 500/);
    const model = ownerMonthly("praha1", "2kk").net;
    expect(Math.round(model / 1000) * 1000).toBe(50000);
    expect(strip(cs.g_num3_value)).toMatch(/50 000/);
  });

  it("jedna pojmenovaná nabídka: hero, kalkulačka i garance mají stejné CTA", () => {
    expect(cs.hero_cta).toBe(cs.calc_cta);
    expect(cs.hero_cta).toBe(cs.g_cta);
    expect(cs.hero_cta).toBe(cs.process_cta);
    expect(cs.hero_cta).toBe(cs.mobile_cta);
    expect(vi.hero_cta).toBe(vi.calc_cta);
    expect(vi.hero_cta).toBe(vi.g_cta);
  });

  it("české hero má jediné tlačítko a vede na kalkulačku", () => {
    // HeroSection čte prázdné hero_cta2 jako „jedno CTA" a přepne cíl na
    // #kalkulacka. Vietnamská verze druhé tlačítko má a míří na formulář.
    expect(cs.hero_cta2).toBe("");
    expect(vi.hero_cta2).not.toBe("");
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

describe("délka smlouvy a výpověď", () => {
  it("12 měsíců závazku, pak doba neurčitá, výpověď 4 měsíce", () => {
    expect(strip(cs.faq7_a)).toMatch(/12 měsíců/);
    expect(strip(cs.faq7_a)).toMatch(/dobu neurčitou/);
    expect(strip(cs.faq7_a)).toMatch(/4 měsíce/);
    expect(strip(vi.faq7_a)).toMatch(/12 tháng/);
    expect(strip(vi.faq7_a)).toMatch(/4 tháng/);
  });

  it("nikde nezůstala stará šestiměsíční lhůta", () => {
    expect(strip(cs.faq7_a)).not.toMatch(/6 měsíc/);
    expect(strip(vi.faq7_a)).not.toMatch(/6 tháng/);
  });

  it("neprodává otevřený kalendář jako délku smlouvy", () => {
    // Kalendář otevíráme zhruba 8 měsíců dopředu. Je to provozní politika,
    // ne délka závazku, a na webu se tím výpovědní lhůta nezdůvodňuje.
    expect(strip(cs.faq7_a)).not.toMatch(/kalendář/i);
    expect(strip(vi.faq7_a)).not.toMatch(/lịch nhà/i);
  });
});

describe("krytí drobných škod od hostů", () => {
  it("je v odměně, stejně jako garance", () => {
    expect(cs.pr7_price).toBe(cs.pr6_price);
    expect(vi.pr7_price).toBe(vi.pr6_price);
  });

  it("limit je 5 000 Kč na pokoj ročně, nejvýše 25 000 Kč", () => {
    expect(DAMAGE_COVER_PER_ROOM).toBe(5000);
    expect(DAMAGE_COVER_MAX).toBe(25000);
    expect(annualDamageCover(1)).toBe(5000);
    expect(annualDamageCover(2)).toBe(10000);
    expect(annualDamageCover(3)).toBe(15000);
    expect(annualDamageCover(4)).toBe(20000);
    expect(annualDamageCover(5)).toBe(25000);
    expect(annualDamageCover(6)).toBe(25000);
    expect(annualDamageCover(12)).toBe(25000);
    expect(annualDamageCover(0)).toBe(0);
  });

  it("dispozice v kalkulačce se mapují na počet pokojů", () => {
    // Kalkulačka bere počet pokojů z ROOMS, žádný další vstup nepřibyl.
    expect(ROOMS).toEqual({ "1kk": 1, "2kk": 2, "3kk": 3, "4kk": 4 });
    expect(annualDamageCover(ROOMS["2kk"])).toBe(10000);
    expect(annualDamageCover(ROOMS["4kk"])).toBe(20000);
  });

  it("strop 25 000 Kč je v kopii i ve vietnamštině", () => {
    const max = `${DAMAGE_COVER_MAX / 1000} 000 Kč`;
    for (const key of ["g_pair2_text", "pr7_note"] as const) {
      expect(strip(cs[key]), `cs.${key}`).toContain(max);
      expect(strip(vi[key]), `vi.${key}`).toContain(max);
    }
  });

  it("žebříček ve FAQ sedí s pravidlem pro každou dispozici", () => {
    for (const size of ["1kk", "2kk", "3kk", "4kk"] as const) {
      const amount = `${annualDamageCover(ROOMS[size]) / 1000} 000 Kč`;
      expect(strip(cs.faq11_a), `cs ${size}`).toContain(amount);
      expect(strip(vi.faq11_a), `vi ${size}`).toContain(amount);
    }
    expect(strip(cs.faq11_a)).toContain(`${DAMAGE_COVER_MAX / 1000} 000 Kč`);
    expect(strip(vi.faq11_a)).toContain(`${DAMAGE_COVER_MAX / 1000} 000 Kč`);
  });

  it("částku počítá jedno místo: lib/yield, ne komponenta ani MCP", () => {
    const calc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calc).toContain("annualDamageCover(ROOMS[size])");
    expect(calc).not.toContain("25000");
    expect(calc).not.toContain("5000");
    const mcp = readFileSync("src/lib/mcp/tools/get-services.ts", "utf8");
    expect(mcp).toContain("DAMAGE_COVER_MAX");
    expect(mcp).not.toContain("25000");
  });

  it("pořadí je host, platforma, teprve pak Antam", () => {
    expect(strip(cs.faq11_a)).toMatch(/AirCover/);
    expect(strip(cs.faq11_a)).toMatch(/nepodaří získat/);
    expect(strip(vi.faq11_a)).toMatch(/AirCover/);
    expect(strip(vi.faq11_a)).toMatch(/không đòi được/);
  });

  it("nemíchá škody od hostů s opotřebením a opravami", () => {
    expect(strip(cs.faq11_a)).toMatch(/[Oo]potřebení/);
    expect(strip(cs.faq11_a)).toMatch(/20 000 Kč za rok/);
    expect(strip(vi.faq11_a)).toMatch(/20 000 Kč/);
  });

  it("není to pojištění a nikde se tak nejmenuje", () => {
    for (const [lang, dict] of [["cs", cs], ["vi", vi]] as const) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== "string") continue;
        expect(value, `${lang}.${key}`).not.toMatch(/pojiš|bảo hiểm/i);
      }
    }
  });
});

describe("dělící pruh v ceníku", () => {
  it("kreslí 70/30, ne staré 75/25", () => {
    // Pruh byl v ceníku natvrdo 75/25, zatímco popisky vedle něj říkaly 70/30.
    // Číslo v kopii hlídají testy výše; tenhle hlídá ten obrázek.
    const src = readFileSync("src/components/PricingSection.tsx", "utf8");
    expect(src).toContain("w-[70%]");
    expect(src).toContain("w-[30%]");
    expect(src).not.toContain("w-[75%]");
    expect(src).not.toContain("w-[25%]");
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
