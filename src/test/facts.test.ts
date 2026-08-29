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
  OCCUPANCY_BY_FLAT, OCCUPANCY_OURS, LTR_PER_M2, SIZE_COEF, MEDIAN_AREA, rentFor,
} from "@/lib/yield";

const cs = translations.cs as Record<string, string>;
const vi = translations.vi as Record<string, string>;
const strip = (s: string) => s.replace(/ /g, " ");

describe("odměna za správu", () => {
  it("je 30 % v modelu", () => {
    // Zvýšena z 28 % na 30 % dne 28. 8. 2026 (rozhodnutí majitele; konečná cena
    // včetně DPH). Sazba žije jen tady a v MCP; kdyby se změnila znovu, musí se
    // s ní přepočítat i karty portfolia.
    expect(MGMT_FEE).toBe(0.30);
  });

  it("je 30 % všude v české i vietnamské kopii", () => {
    expect(strip(cs.pr1_price)).toMatch(/30 %/);
    expect(strip(vi.pr1_price)).toMatch(/30 %/);
    for (const key of ["calc_net_sub", "calc_excluded_note", "faq5_a", "faq9_a", "report_row_costs", "faq17_a"]) {
      expect(strip(cs[key]), `cs.${key}`).toMatch(/30\s?%/);
      expect(strip(vi[key]), `vi.${key}`).toMatch(/30\s?%/);
    }
  });

  it("nikde nezůstalo staré 25 % a 28 % ani dělení 75/25 a 72/28", () => {
    for (const [lang, dict] of [["cs", cs], ["vi", vi]] as const) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== "string") continue;
        const v = strip(value);
        // 25 000 Kč (uvedení do provozu) je jiné číslo a zůstává.
        // faq17_a smí 25 % zmínit: je to vědomá srovnávací matematika základů
        // ("25 % z tržeb před provizí"), ne stará sazba.
        if (key !== "faq17_a") {
          expect(v.replace(/25 000/g, ""), `${lang}.${key}`).not.toMatch(/25\s?%/);
        }
        expect(v, `${lang}.${key}`).not.toMatch(/28\s?%/);
        expect(v, `${lang}.${key}`).not.toMatch(/75\s?\/\s?25/);
        expect(v, `${lang}.${key}`).not.toMatch(/72\s?\/\s?28/);
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
    // Antam ji hradí ze své odměny. Kdyby se vrátila do
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

  it("vietnamské hero teaser drží a sedí s kartami portfolia (57/64 tis.)", () => {
    // Při odměně 30 % vychází 405 na 57 000 a 402 na 64 000 (zaokrouhleno
    // na tisíce). Kdyby se karty znovu přepočítaly, musí se posunout i teaser.
    expect(strip(vi.hero_extra)).toMatch(/57 000/);
    expect(strip(vi.hero_extra)).toMatch(/64 000/);
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
    // Čísla se neuvádějí natvrdo: odvozují se z modelu, aby copy nemohla odejít
    // od tabulky nájmů, když se přepočítá zdroj (28. 8. 2026 Deloitte + MF).
    const rent = LTR.praha1["2kk"];
    const minimum = rent + ENERGY["2kk"];
    expect(strip(cs.g_num1_value)).toMatch(new RegExp(rent.toLocaleString("cs-CZ").replace(/\s/g, " ")));
    expect(strip(cs.g_num2_value)).toMatch(new RegExp(minimum.toLocaleString("cs-CZ").replace(/\s/g, " ")));
    expect(strip(vi.g_num1_value)).toMatch(new RegExp(rent.toLocaleString("cs-CZ").replace(/\s/g, " ")));
    expect(strip(vi.g_num2_value)).toMatch(new RegExp(minimum.toLocaleString("cs-CZ").replace(/\s/g, " ")));
    const model = Math.round(ownerMonthly("praha1", "2kk").net / 1000) * 1000;
    const shown = model.toLocaleString("cs-CZ").replace(/\s/g, " ");
    expect(strip(cs.g_num3_value), "g_num3_value vs model").toMatch(new RegExp(shown));
    expect(strip(vi.g_num3_value), "vi g_num3_value vs model").toMatch(new RegExp(shown));
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

  it("nepřeslibuje: model zůstane pod každým publikovaným bytem", () => {
    // Pravidlo: veřejné číslo musí vlastní portfolio PŘEKONAT, nikdy ho minout.
    // Měříme proti tomu, co je na kartách, tedy proti tomu, co si návštěvník
    // může ověřit. Kalkulačka počítá s 84 % obsazeností, byty jedou 94 %.
    const published: [Parameters<typeof ownerMonthly>[0], number, number][] = [
      ["praha1", 8, 57000],  // 405, nejslabší publikovaný na Praze 1
      ["praha3", 6, 50000],  // Modern AC
      ["praha3", 6, 42000],  // byt se zahradou
    ];
    for (const [loc, guests, real] of published)
      expect(ownerMonthly(loc, guests).net, `${loc} / ${guests} hostů`).toBeLessThan(real);
  });

  it("Mozart je vědomá výjimka z pravidla, dokud se nezdraží na trh", () => {
    // Karta Mozartu (Praha 5, 4 hosté) ukazuje 30 000 Kč, model dává víc,
    // protože Mozart jede ADR ~1 700 Kč proti tržnímu mediánu 2 265 Kč.
    // Rozhodnutí majitele 28. 8. 2026: řeší se cenou Mozartu, ne modelem.
    // Až tenhle test spadne (model <= karta), výjimka pominula: smaž ho
    // a přesuň Mozarta do seznamu `published` výše.
    expect(ownerMonthly("praha5", 4).net).toBeGreaterThan(30000);
  });

  it("byt 302 je na hraně, protože není publikovaný", () => {
    // 302 (Praha 1, neveřejný) dává majiteli při 30 % už jen 54 391 Kč
    // (měřených 55 945 při 28 % krát 70/72). Model dává víc. Kdyby se 302
    // na web přidal, obsazenost v kalkulačce musí dolů. Tenhle test to hlídá.
    const MEASURED_302 = 54391;
    const model = ownerMonthly("praha1", "2kk").net;
    if (model >= MEASURED_302) {
      const src = readFileSync("src/components/PortfolioSection.tsx", "utf8");
      expect(src, "302 je na webu, ale model ho přeslibuje").not.toContain("302");
    }
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
  it("kreslí 72/28, ne starší poměry", () => {
    // Pruh v ceníku už jednou zůstal na starém poměru, zatímco popisky vedle něj
    // říkaly nový. Čísla v kopii hlídají testy výše; tenhle hlídá ten obrázek.
    const src = readFileSync("src/components/PricingSection.tsx", "utf8");
    expect(src).toContain("w-[70%]");
    expect(src).toContain("w-[30%]");
    for (const stale of ["w-[75%]", "w-[25%]", "w-[72%]", "w-[28%]"]) {
      expect(src, stale).not.toContain(stale);
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

/* ── Obsazenost na kartách ──────────────────────────────────────────────────
   Obsazenost žije na kartách portfolia, samostatnou sekci nemáme. Testy hlídají,
   že se karty a lib/yield nerozejdou a že je u každého čísla i trh. Když spadnou,
   protože se obsazenost přeměřila, oprav lib/yield i karty, ne test. */
describe("obsazenost na kartách portfolia", () => {
  const portfolio = readFileSync("src/components/PortfolioSection.tsx", "utf8");

  it("karty ukazují stejnou obsazenost, jakou drží lib/yield", () => {
    const flat = (x: string) => x.replace(/\\u00a0/g, " ").replace(/\u00a0/g, " ");
    const src = flat(portfolio);
    for (const f of OCCUPANCY_BY_FLAT) {
      const name = flat(f.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = new RegExp(`${name}[^\n]*occupancy: (\\d+), market: (\\d+)`).exec(src);
      expect(m, `karta chybí, nemá obsazenost nebo trh: ${f.name}`).not.toBeNull();
      expect(Number(m![1]), `${f.name} obsazenost`).toBe(f.occupancy);
      expect(Number(m![2]), `${f.name} trh`).toBe(f.market);
    }
  });

  it("každý byt má rozumnou obsazenost a měřené okno", () => {
    expect(OCCUPANCY_BY_FLAT.length).toBeGreaterThanOrEqual(6);
    for (const f of OCCUPANCY_BY_FLAT) {
      expect(f.occupancy, f.name).toBeGreaterThan(50);
      expect(f.occupancy, f.name).toBeLessThanOrEqual(100);
      expect(f.days, f.name).toBeGreaterThanOrEqual(45);
    }
  });

  it("trh je pro každý byt jiný a každý byt ho překonává", () => {
    expect(portfolio).toMatch(/statVsMarket\(item\.stats\.market\)/);
    for (const f of OCCUPANCY_BY_FLAT) {
      expect(f.market, `${f.name} trh`).toBeGreaterThan(0);
      expect(f.market, `${f.name} trh`).toBeLessThan(f.occupancy);
    }
    // jedno společné číslo by bylo špatně: lokality se liší
    expect(new Set(OCCUPANCY_BY_FLAT.map((f) => f.market)).size).toBeGreaterThan(1);
  });

  it("poznámka pod kartami vysvětluje, jak se obsazenost počítá", () => {
    expect(portfolio).toContain("45 dní");
    expect(portfolio).toContain("PriceLabs");
    expect(portfolio).toContain("pro každý byt jiný");
    expect(portfolio).not.toContain("—");
  });

  it("samostatná sekce Obsazenost na stránce není", () => {
    const index = readFileSync("src/pages/Index.tsx", "utf8");
    expect(index).not.toContain("OccupancySection");
  });
});

/* ── Nájem podle plochy ─────────────────────────────────────────────────────
   Dispozice sama o sobě nájem neurčuje: 2+kk může mít 45 i 90 m². Nájem proto
   počítáme z Kč/m² (Deloitte) krát plocha krát koeficient dispozice (MF).
   Testy hlídají, že se to nikde nerozejde a že karty používají skutečné plochy. */
describe("nájem podle plochy", () => {
  it("tabulka LTR odpovídá vzorci plocha × Kč/m² × koeficient", () => {
    for (const loc of Object.keys(LTR_PER_M2) as (keyof typeof LTR_PER_M2)[])
      for (const size of Object.keys(MEDIAN_AREA) as (keyof typeof MEDIAN_AREA)[]) {
        const expected = MEDIAN_AREA[size] * LTR_PER_M2[loc] * SIZE_COEF[size];
        // tabulka je zaokrouhlená na 500 Kč, takže povolíme půl kroku
        expect(Math.abs(LTR[loc][size] - expected), `${loc} ${size}`).toBeLessThanOrEqual(250);
      }
  });

  it("menší byt má vyšší nájem za m² a větší byt vyšší nájem celkem", () => {
    expect(SIZE_COEF["1kk"]).toBeGreaterThan(SIZE_COEF["2kk"]);
    expect(SIZE_COEF["2kk"]).toBeGreaterThan(SIZE_COEF["3kk"]);
    for (const loc of Object.keys(LTR) as (keyof typeof LTR)[]) {
      expect(LTR[loc]["2kk"], loc).toBeGreaterThan(LTR[loc]["1kk"]);
      expect(LTR[loc]["3kk"], loc).toBeGreaterThan(LTR[loc]["2kk"]);
      expect(LTR[loc]["4kk"], loc).toBeGreaterThan(LTR[loc]["3kk"]);
    }
  });

  it("stejná dispozice s jinou plochou dá jiný nájem", () => {
    // přesně ten případ, kvůli kterému se to přestavovalo
    expect(rentFor("praha3", "2kk", 45)).toBeLessThan(rentFor("praha3", "2kk", 90));
    expect(rentFor("praha3", "2kk", 90) / rentFor("praha3", "2kk", 45)).toBeCloseTo(2, 1);
  });

  it("každý byt v portfoliu má plochu a ta sedí na kartu", () => {
    const src = readFileSync("src/components/PortfolioSection.tsx", "utf8");
    for (const f of OCCUPANCY_BY_FLAT) {
      expect(f.m2, f.name).toBeGreaterThan(15);
      expect(f.m2, f.name).toBeLessThan(200);
      const flat = (x: string) => x.replace(/\\u00a0/g, " ").replace(/\u00a0/g, " ");
      const name = flat(f.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = new RegExp(`${name}[^\n]*m2: (\\d+)`).exec(flat(src));
      expect(m, `karta nemá plochu: ${f.name}`).not.toBeNull();
      expect(Number(m![1]), f.name).toBe(f.m2);
    }
  });

  it("nikde v src už není citovaná konkurence", () => {
    // Cenová mapa Bohemian Estates je jen přebalená mapa MF. Citujeme originál.
    const files = [
      "src/components/PortfolioSection.tsx", "src/components/CalculatorSection.tsx",
      "src/i18n/translations.ts", "src/lib/yield.ts",
      "src/lib/mcp/tools/estimate-yield.ts", "src/lib/mcp/tools/list-portfolio.ts",
    ];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      const hits = src.split("\n").filter((l) => l.includes("Bohemian Estates"));
      expect(hits, `${f} cituje konkurenta`).toEqual([]);
    }
    const pf = readFileSync("src/components/PortfolioSection.tsx", "utf8");
    expect(pf).toContain("Deloitte");
    expect(pf).toContain("Ministerstva financí");
  });
});
