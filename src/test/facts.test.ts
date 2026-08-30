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
  ENERGY, MGMT_FEE, PLATFORM_FEE, LAUNCH_FEE, ROOMS,
  DAMAGE_COVER_PER_ROOM, DAMAGE_COVER_MAX, annualDamageCover, ownerMonthly,
  OCCUPANCY_BY_FLAT, LTR_PER_M2, SIZE_COEF, MEDIAN_AREA, rentFor,
  MARKET_STR, MARKET_OCC, SEASONS_BY_LOC, isMeasured, bandFor, antamOccupancy,
  OCC_UPLIFT, OCC_CAP, marketOccPct, ratioFor, areaCoef, SIZE_PRESET, SIZE_AREA, SIZE_RATIO, marketCell,
  type MeasuredLocation, type SizeKey,
} from "@/lib/yield";
import { fiveYear } from "@/lib/horizon";

/** ownerMonthly vrací supported-flag; testy chtějí číslo, nebo spadnout. */
const net = (r: ReturnType<typeof ownerMonthly>) => {
  if (!r.supported) throw new Error("ownerMonthly: unsupported combination in test");
  return r.antam.net;
};
/** Dispozice, která spadne do daného pásma trhu. */
const sizeOf = (band: string): SizeKey => band === "1BR" ? "2kk" : band === "2BR" ? "3kk" : "4kk";

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
    expect(strip(vi.pr1_price)).toMatch(/30%/); // vietnamština píše procenta bez mezery
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
    // Věta „DPH z provize odvádíme my ze své odměny" žije od patche 126
    // v poznámce kalkulačky (pr1_note nese příklad toku peněz). Fakt trvá,
    // jen bydlí jinde; test hlídá fakt, ne místo.
    expect(strip(cs.calc_method_note)).toMatch(/DPH z provize/);
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
  it("vzorový tok peněz v ceníku sedí matematicky (účet − úklid, 70/30)", () => {
    // Vzor je 90 000 Kč na účtu (rozhodnutí majitele 29. 8. 2026). Test nehlídá
    // konkrétní částku, ale aritmetiku: kdyby se vzor znovu měnil, musí sedět.
    const num = (v: string) => Number(strip(v).replace(/[^0-9]/g, ""));
    for (const dict of [cs, vi]) {
      const bank = num(dict.pr1_flow1_v);
      const cleaning = num(dict.pr1_flow2_v);
      const owner = num(dict.pr1_flow4_v);
      const fee = num(dict.pr1_flow5_v);
      const net = bank - cleaning;
      expect(bank).toBeGreaterThan(0);
      expect(owner).toBe(Math.round(net * 0.7));
      expect(fee).toBe(Math.round(net * 0.3));
      expect(owner + fee).toBe(net);
    }
    expect(strip(cs.pr1_note)).toMatch(/90 000/);
    expect(strip(vi.pr1_note)).toMatch(/90 000/);
  });

  it("stará doporučovací mechanika (15 000 zpět, 1 % z výnosu) zmizela", () => {
    for (const [lang, dict] of [["cs", cs], ["vi", vi]] as const) {
      expect(strip(dict.pr8_note), `${lang}.pr8_note`).not.toMatch(/15 000/);
      expect(strip(dict.pr8_price), `${lang}.pr8_price`).not.toMatch(/15 000/);
      expect(strip(dict.pr8_note), `${lang}.pr8_note`).not.toMatch(/(^|[^\d])1 ?% /);
    }
    // Nová podoba: doporučený a PŘIJATÝ majitel = uvedení do provozu zdarma.
    expect(strip(cs.pr8_note)).toMatch(/přijmeme do správy/);
    expect(strip(cs.pr8_note)).toMatch(/zdarma/);
    expect(strip(vi.pr8_note)).toMatch(/Antam nhận/);
    expect(strip(vi.pr8_note)).toMatch(/hoàn lại/);
  });

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

  it("ilustrační dvojice v garanci sedí s modelem nájmu a třetí slot je prázdný", () => {
    // Minimum = nájem + energie pro Prahu 1 2+kk; očekávaný výnos = co dá kalkulačka.
    // Čísla se neuvádějí natvrdo: odvozují se z modelu, aby copy nemohla odejít
    // od tabulky nájmů, když se přepočítá zdroj (28. 8. 2026 Deloitte + MF).
    // Nájem z rentFor (jediná funkce na nájem), zaokrouhlený na tisíce pro copy.
    const rent = Math.round(rentFor("praha1", "2kk") / 1000) * 1000;
    const minimum = rent + ENERGY["2kk"];
    expect(strip(cs.g_num1_value)).toMatch(new RegExp(rent.toLocaleString("cs-CZ").replace(/\s/g, " ")));
    expect(strip(cs.g_num2_value)).toMatch(new RegExp(minimum.toLocaleString("cs-CZ").replace(/\s/g, " ")));
    expect(strip(vi.g_num1_value)).toMatch(new RegExp(rent.toLocaleString("cs-CZ").replace(/\s/g, " ")));
    expect(strip(vi.g_num2_value)).toMatch(new RegExp(minimum.toLocaleString("cs-CZ").replace(/\s/g, " ")));
    // Garance je risk reversal, ne další odhad: třetí slot „očekávaný výnos"
    // zůstává prázdný (upside prodává portfolio a kalkulačka).
    expect(strip(cs.g_num3_value), "g_num3_value musí zůstat prázdné").toBe("");
    expect(strip(vi.g_num3_value), "vi g_num3_value musí zůstat prázdné").toBe("");
    // Popisek pod dvojicí rozepisuje nájem + energie; musí sedět na model,
    // jinak se vrátí drift „26 000 + ? = 29 500" z auditu 29. 8. 2026.
    const rentRe = new RegExp(rent.toLocaleString("cs-CZ").replace(/\s/g, " "));
    const energyRe = new RegExp(ENERGY["2kk"].toLocaleString("cs-CZ").replace(/\s/g, " "));
    expect(strip(cs.g_num_note)).toMatch(rentRe);
    expect(strip(cs.g_num_note)).toMatch(energyRe);
    expect(strip(vi.g_num_note)).toMatch(rentRe);
    expect(strip(vi.g_num_note)).toMatch(energyRe);
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
  it("drží tržní data čtvrtí z PriceLabs (30. 8. 2026) a sedí na uložený dataset", () => {
    // Zdroj pravdy: data/pricelabs-2026-08/*.json (STR index, oficiální
    // hranice čtvrtí, 8/2025 až 7/2026). Konstanty v yield.ts jsou z nich
    // vygenerované; tenhle test hlídá, že se nerozejdou.
    for (const [loc, bands] of Object.entries(MARKET_STR)) {
      const raw = JSON.parse(readFileSync(`data/pricelabs-2026-08/${loc}.json`, "utf8"));
      for (const [band, cell] of Object.entries(bands)) {
        const r = raw[band];
        expect(cell.adr, `${loc} ${band} adr`).toBe(Math.round(r.annual.adr));
        const revparMean = r.revpar.reduce((a: number, b: number) => a + b, 0) / 12;
        expect(Math.abs(cell.revpar - revparMean), `${loc} ${band} revpar`).toBeLessThan(0.06);
        // obsazenost implikovaná modelem = tržní průměr čtvrti (RevPAR/ADR)
        expect(cell.revpar / cell.adr).toBeGreaterThan(0.5);
        expect(cell.revpar / cell.adr).toBeLessThan(0.85);
        // buňky jen se solidním vzorkem
        expect(cell.listings, `${loc} ${band} vzorek`).toBeGreaterThanOrEqual(50);
      }
    }
    // tenké buňky zůstávají venku (P3 3BR: 46 nabídek, P9 2BR: 24, P4 3BR: 6)
    expect(MARKET_STR.praha3["3BR"]).toBeUndefined();
    expect(MARKET_STR.praha9["2BR"]).toBeUndefined();
    expect(MARKET_STR.praha4["3BR"]).toBeUndefined();
  });

  it("pásmo trhu dává dispozice (ložnice), ne počet hostů: dva vstupy", () => {
    expect(bandFor("1kk")).toBe("1BR");
    expect(bandFor("2kk")).toBe("1BR");
    expect(bandFor("3kk")).toBe("2BR");
    expect(bandFor("4kk")).toBe("3BR");
    // předvolba dispozice nese jen plochu, žádné hosty
    for (const k of ["1kk", "2kk", "3kk", "4kk"] as const) expect(Object.keys(SIZE_PRESET[k])).toEqual(["m2"]);
    const calc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calc, "posuvník hostů se do kalkulačky nesmí vrátit").not.toContain("calc-guests");
  });

  it("plocha se nezadává: každá dispozice má rozsah od–do a nájem pro typickou plochu uprostřed", () => {
    for (const k of ["1kk", "2kk", "3kk", "4kk"] as const) {
      const [lo, hi] = SIZE_AREA[k];
      expect(lo).toBeLessThan(MEDIAN_AREA[k]);
      expect(hi).toBeGreaterThan(MEDIAN_AREA[k]);
      expect(SIZE_PRESET[k].m2).toBe(MEDIAN_AREA[k]);
    }
    const calc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calc).not.toContain('id="calc-m2"');
    expect(calc).toContain("SIZE_AREA[size]");
    expect(calc).toContain("?byt=${location}-${size}-${season}#kalkulacka");
    for (const k of ["calc_area_range_1", "calc_area_range_4", "calc_derived_note"]) {
      expect(strip(cs[k]).length).toBeGreaterThan(0);
      expect(strip(vi[k]).length).toBeGreaterThan(0);
    }
  });

  it("tenká pásma se dopočítají z nejbližšího spolehlivého pásma × celoměstský poměr a nesou derived", () => {
    // poměr = vážený průměr přes čtvrti, kde mají obě pásma ≥ 50 nabídek (tytéž řady)
    const w = (pairs: [number, number, number][]) => pairs.reduce((a, p) => a + p[0] * p[2], 0) / pairs.reduce((a, p) => a + p[2], 0);
    const r21: [number, number, number][] = [], r32: [number, number, number][] = [];
    for (const loc of Object.keys(MARKET_STR) as MeasuredLocation[]) {
      const raw = JSON.parse(readFileSync(`data/pricelabs-2026-08/${loc}.json`, "utf8"));
      const c = (b: string) => ({ adr: raw[b].annual.adr as number, rp: raw[b].revpar.reduce((a: number, x: number) => a + x, 0) / 12, n: raw[b].active_listings.reduce((a: number, x: number) => a + x, 0) / 12 });
      const b1 = c("1BR"), b2 = c("2BR"), b3 = c("3BR");
      if (b2.n >= 50) r21.push([b2.adr / b1.adr, b2.rp / b1.rp, b2.n]);
      if (b3.n >= 50) r32.push([b3.adr / b2.adr, b3.rp / b2.rp, b3.n]);
    }
    expect(SIZE_RATIO["2BR/1BR"].adr).toBeCloseTo(w(r21), 2);
    expect(SIZE_RATIO["2BR/1BR"].revpar).toBeCloseTo(w(r21.map((p) => [p[1], 0, p[2]])), 2);
    expect(SIZE_RATIO["3BR/2BR"].adr).toBeCloseTo(w(r32), 2);
    expect(SIZE_RATIO["3BR/2BR"].revpar).toBeCloseTo(w(r32.map((p) => [p[1], 0, p[2]])), 2);
    // měřené buňky nejsou derived, dopočítané ano; P9 3BR jde přes dva kroky
    expect(marketCell("praha1", "3BR")!.derived).toBe(false);
    expect(marketCell("praha3", "3BR")!.derived).toBe(true);
    expect(marketCell("praha3", "3BR")!.adr).toBe(Math.round(MARKET_STR.praha3["2BR"]!.adr * SIZE_RATIO["3BR/2BR"].adr));
    expect(marketCell("praha9", "2BR")!.derived).toBe(true);
    expect(marketCell("praha9", "3BR")!.adr).toBe(Math.round(Math.round(MARKET_STR.praha9["1BR"]!.adr * SIZE_RATIO["2BR/1BR"].adr) * SIZE_RATIO["3BR/2BR"].adr));
    const r = ownerMonthly("praha4", "4kk");
    expect(r.supported && r.derived).toBe(true);
    const r1 = ownerMonthly("praha1", "2kk");
    expect(r1.supported && r1.derived).toBe(false);
    // a web to u odvozeného čísla napíše
    expect(readFileSync("src/components/CalculatorSection.tsx", "utf8")).toContain("calc_derived_note");
  });

  it("čtvrti a pásma bez dostatečného vzorku žádné číslo nevracejí", () => {
    // Praha 10 čeká na doplnění dat (rate limit 30. 8.), "jinde" nikdy.
    for (const loc of ["praha10", "jinde"])
      expect(ownerMonthly(loc, "3kk").supported, loc).toBe(false);
    // každá změřená čtvrť má číslo pro všechny dispozice (tenká pásma odvozená)
    for (const loc of ["praha1", "praha2", "praha3", "praha4", "praha5", "praha6", "praha7", "praha8", "praha9"])
      for (const size of ["1kk", "2kk", "3kk", "4kk"] as const)
        expect(ownerMonthly(loc, size).supported, `${loc} ${size}`).toBe(true);
  });

  it("sezóny každé čtvrti skládají přesně rok (7 léto + 4 zima + prosinec), ADR i RevPAR", () => {
    for (const loc of Object.keys(SEASONS_BY_LOC) as MeasuredLocation[]) {
      const f = SEASONS_BY_LOC[loc];
      for (const k of ["adr", "revpar"] as const)
        expect(Math.abs((7 * f.summer[k] + 4 * f.winter[k] + 1 * f.xmas[k]) / 12 - 1), `${loc} ${k}`).toBeLessThan(0.005);
      // zima nese propad obsazenosti: RevPAR padá hlouběji než ADR
      expect(f.winter.revpar, loc).toBeLessThan(f.winter.adr);
      // prosinec je vždy nejsilnější
      expect(f.xmas.revpar, loc).toBeGreaterThan(f.summer.revpar);
    }
  });

  it("průměr trhu je čistý tržní benchmark a číslo s Antam stojí na téže ceně za noc", () => {
    // Rozhodnutí majitele 30. 8. 2026: kalkulačka ukazuje reálnou tržní cenu
    // (průměr trhu čtvrti) A k tomu odhad s Antam Homes. Obě z téže ceny za
    // noc; liší se jen obsazeností (trh × 1,15, strop 85 %, nikdy pod trhem).
    expect(OCC_UPLIFT).toBe(1.15);
    expect(OCC_CAP).toBe(0.85);
    expect(antamOccupancy(0.70)).toBeCloseTo(0.805, 3);
    expect(antamOccupancy(0.80)).toBe(0.85);
    expect(antamOccupancy(0.90)).toBe(0.90);
    for (const [loc, bands] of Object.entries(MARKET_STR))
      for (const [band, cell] of Object.entries(bands)) {
        const r = ownerMonthly(loc, sizeOf(band));
        if (!r.supported) throw new Error(`${loc} ${band} má data, ale model je nevrací`);
        expect(r.band).toBe(band);
        // průměr trhu: gross přesně z tržního RevPAR, žádný jiný vstup
        expect(r.market.gross, `${loc} ${band}`).toBe(Math.round(cell.revpar * 30.44));
        expect(r.adr).toBe(cell.adr);
        // s Antam: táž cena × zvednutá obsazenost, nikdy pod trhem, nikdy nad 85 % (leda trh sám)
        expect(r.antam.occupancy).toBeGreaterThanOrEqual(r.market.occupancy);
        expect(r.antam.occupancy).toBeLessThanOrEqual(Math.max(OCC_CAP, r.market.occupancy));
        expect(r.antam.gross).toBe(Math.round(r.adr * r.antam.occupancy * 30.44));
        expect(r.antam.net).toBeGreaterThanOrEqual(r.market.net);
        // obsazenost na trhu sedí s tím, co vidí karty (marketOccPct)
        expect(Math.round(r.market.occupancy * 100)).toBe(marketOccPct(loc as MeasuredLocation, band as "1BR" | "2BR" | "3BR"));
      }
    // byty v naší správě měří víc, než s čím model počítá (85 %)
    for (const f of OCCUPANCY_BY_FLAT) expect(f.occupancy).toBeGreaterThanOrEqual(OCC_CAP * 100);
  });

  it("pětiletý graf počítá ze stejného čísla jako kalkulačka, obě křivky", () => {
    for (const loc of ["praha1", "praha3", "praha5"] as const)
      for (const size of ["2kk", "3kk"] as const) {
        const r = ownerMonthly(loc, size);
        const d = fiveYear(loc, size, MEDIAN_AREA[size], "airbnb");
        if (!r.supported || !d) throw new Error(`${loc} ${size}`);
        // 2. rok (po rozjezdu): měsíční přírůstek = net − energie − obnova
        expect(d.str[24] - d.str[23]).toBeCloseTo((r.antam.net - d.energy - d.renew) * 1.03, 5);
        expect(d.strMarket[24] - d.strMarket[23]).toBeCloseTo((r.market.net - d.energy - d.renew) * 1.03, 5);
        expect(d.netMarket).toBe(r.market.net);
        expect(d.rent).toBe(rentFor(loc, size));
        expect(d.lt[12] - d.lt[11]).toBeCloseTo(d.rent, 5);
      }
    const hz = readFileSync("src/components/HorizonSection.tsx", "utf8");
    expect(hz).toContain("d.strMarket");
    expect(hz).toContain("fiveYear(location, size, m2, furn)");
  });

  it("byt 302 zůstává nepublikovaný, dokud tržní model dává víc než jeho měření", () => {
    // 302 (Praha 1, neveřejný) dává majiteli při 30 % 54 391 Kč. Tržní model
    // P1/2BR dává víc (~60 100), takže 302 na web nepatří; jinak by karta
    // podstřelovala benchmark, který stránka sama ukazuje.
    const MEASURED_302 = 54391;
    const model = net(ownerMonthly("praha1", "3kk")); // 302 má dvě ložnice
    if (model >= MEASURED_302) {
      const src = readFileSync("src/components/PortfolioSection.tsx", "utf8");
      expect(src, "302 je na webu, ale tržní model ho přeslibuje").not.toContain("302");
    }
  });
  it("nájem (rentFor) a energie pokrývají všechny čtvrti a dispozice", () => {
    // Nájemní data (Deloitte + MF) pokrývají celou Prahu, i čtvrti, kde výnos
    // nepočítáme; jediná funkce na nájem je rentFor.
    for (const key of Object.keys(LTR_PER_M2) as (keyof typeof LTR_PER_M2)[]) {
      for (const size of ["1kk", "2kk", "3kk", "4kk"] as const) {
        expect(rentFor(key, size), `${key}.${size}`).toBeGreaterThan(0);
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
      const m = new RegExp(`${name}[^\n]*occupancy: (\\d+), market: MARKET_OCC\\.(\\w+)`).exec(src);
      expect(m, `karta chybí, nemá obsazenost nebo trh: ${f.name}`).not.toBeNull();
      expect(Number(m![1]), `${f.name} obsazenost`).toBe(f.occupancy);
      expect(MARKET_OCC[m![2] as keyof typeof MARKET_OCC], `${f.name} trh`).toBe(f.market);
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

  it("trh je jedno číslo NA LOKALITU a každý byt ho překonává", () => {
    // Rozhodnutí majitele 29. 8. 2026: per-byt sondy ve stejném domě dávaly
    // 78 vs 77 jen šumem vzorku. Karty proto ukazují MARKET_OCC lokality.
    for (const f of OCCUPANCY_BY_FLAT) {
      expect(f.market, `${f.name} trh`).toBeGreaterThan(0);
      expect(f.market, `${f.name} trh`).toBeLessThan(f.occupancy);
    }
    const byLoc = new Map<string, Set<number>>();
    for (const f of OCCUPANCY_BY_FLAT) {
      byLoc.set(f.loc, (byLoc.get(f.loc) ?? new Set()).add(f.market));
    }
    for (const [loc, vals] of byLoc) expect(vals.size, `${loc} má víc čísel trhu`).toBe(1);
    // a karty čtou z MARKET_OCC (pruhy K1)
    expect(portfolio).toMatch(/barMarket\(item\.loc\)/);
    // trh na kartách = stejný dataset jako kalkulačka (celá čtvrť, 12 měsíců, pásmo ložnic bytu)
    expect(MARKET_OCC.praha1).toBe(marketOccPct("praha1", "2BR"));
    expect(MARKET_OCC.praha3).toBe(marketOccPct("praha3", "2BR"));
    expect(MARKET_OCC.praha5).toBe(marketOccPct("praha5", "1BR"));
    for (const f of OCCUPANCY_BY_FLAT) {
      const key = f.loc.replace("Praha ", "praha");
      if (isMeasured(key)) expect(f.market, `${f.name} trh`).toBe(marketOccPct(key, f.bedrooms >= 3 ? "3BR" : f.bedrooms === 2 ? "2BR" : "1BR"));
    }
  });

  it("násobek nájmu na kartách se počítá z plochy a čtvrti bytu, ne z ruky", () => {
    // Karty i MCP volají ratioFor; číslo v kódu není. Mladá Boleslav bez zdroje nájmu = bez násobku.
    expect(portfolio).not.toMatch(/ratio: \d/);
    expect(portfolio).toContain("ratioFor(");
    const mcp = readFileSync("src/lib/mcp/tools/list-portfolio.ts", "utf8");
    expect(mcp).not.toMatch(/vsLongTermRent: \d/);
    expect(mcp).toContain("ratioFor(");
    expect(ratioFor("Mladá Boleslav", 85, 30000)).toBeNull();
    // 402: 64 000 / (52 m² × 490 × koef(52)) ≈ 2,5
    expect(ratioFor("Praha 1", 52, 64000)).toBe(2.5);
    expect(ratioFor("Praha 1", 52, 57000)).toBe(2.2);
    expect(ratioFor("Praha 3", 55, 50000)).toBe(1.9);
    expect(ratioFor("Praha 3", 60, 42000)).toBe(1.5);
    expect(ratioFor("Praha 5", 40, 30000)).toBe(1.4);
  });

  it("poznámka pod kartami vysvětluje obsazenost i trh po lokalitách", () => {
    expect(portfolio).toContain("45 dní");
    expect(portfolio).toContain("PriceLabs");
    expect(portfolio).toContain("platí pro celou městskou část");
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
  it("menší byt má vyšší nájem za m² a větší byt vyšší nájem celkem", () => {
    expect(SIZE_COEF["1kk"]).toBeGreaterThan(SIZE_COEF["2kk"]);
    expect(SIZE_COEF["2kk"]).toBeGreaterThan(SIZE_COEF["3kk"]);
    for (const loc of Object.keys(LTR_PER_M2) as (keyof typeof LTR_PER_M2)[]) {
      expect(rentFor(loc, "2kk"), loc).toBeGreaterThan(rentFor(loc, "1kk"));
      expect(rentFor(loc, "3kk"), loc).toBeGreaterThan(rentFor(loc, "2kk"));
      expect(rentFor(loc, "4kk"), loc).toBeGreaterThan(rentFor(loc, "3kk"));
    }
  });

  it("koeficient Kč/m² jde po ploše: mediány MF sedí přesně, mezi nimi interpolace", () => {
    for (const k of ["1kk", "2kk", "3kk", "4kk"] as const) expect(areaCoef(MEDIAN_AREA[k])).toBeCloseTo(SIZE_COEF[k], 6);
    expect(areaCoef(44)).toBeCloseTo(1.09, 6);
    expect(areaCoef(20)).toBe(SIZE_COEF["1kk"]);
    expect(areaCoef(140)).toBe(SIZE_COEF["4kk"]);
    // nálepka dispozice nájem nemění, jen plocha
    expect(rentFor("praha1", "2kk", 52)).toBe(rentFor("praha1", "3kk", 52));
  });

  it("stejná dispozice s jinou plochou dá jiný nájem", () => {
    // přesně ten případ, kvůli kterému se to přestavovalo
    expect(rentFor("praha3", "2kk", 45)).toBeLessThan(rentFor("praha3", "2kk", 90));
    // 90 m² se pronajímá levněji za m² než 45 m² (koeficient po ploše), takže poměr je pod 2
    const ratio = rentFor("praha3", "2kk", 90) / rentFor("praha3", "2kk", 45);
    expect(ratio).toBeGreaterThan(1.5);
    expect(ratio).toBeLessThan(2);
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
