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
  OCCUPANCY_BY_FLAT, MEDIAN_AREA, rentFor,
  MARKET_STR, MARKET_OCC, SEASONS_BY_LOC, isMeasured, bandFor, antamOccupancy,
  OCC_UPLIFT, OCC_CAP, marketOccPct, ratioFor, SIZE_PRESET, SIZE_RATIO, marketCell, guestsFor, BASE_GUESTS,
  RENT_SLOPE, RENT_INTERCEPT, FURN_RENT, TYPICAL_AREA, typicalArea, type LocationKey,
  type MeasuredLocation, type SizeKey,
} from "@/lib/yield";
import { fiveYear } from "@/lib/horizon";

/** ownerMonthly vrací supported-flag; testy chtějí číslo, nebo spadnout. */
const net = (r: ReturnType<typeof ownerMonthly>) => {
  if (!r.supported) throw new Error("ownerMonthly: unsupported combination in test");
  return r.antam.net;
};
/** Dispozice, která spadne do daného pásma trhu. */
const sizeOf = (band: string): SizeKey => band === "1BR" ? "1kk" : band === "2BR" ? "2kk" : "4kk";

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

  it("kapacitu majitel nezadává: odvodí se z dispozice a plochy a určí pásmo trhu (tři vstupy)", () => {
    expect(BASE_GUESTS).toEqual({ "1kk": 4, "2kk": 6, "3kk": 8, "4kk": 10 });
    for (const k of ["1kk", "2kk", "3kk", "4kk"] as const) expect(guestsFor(k)).toBe(BASE_GUESTS[k]);
    expect(bandFor(4)).toBe("1BR");
    expect(bandFor(5)).toBe("2BR");
    expect(bandFor(8)).toBe("2BR");
    expect(bandFor(9)).toBe("3BR");
    // 2+kk s gaučem = 6 hostů = na Airbnb dvě ložnice (tak Antam listuje AC i zahradu)
    const r = ownerMonthly("praha3", "2kk");
    expect(r.supported && r.band).toBe("2BR");
    expect(r.supported && r.guests).toBe(6);
    const calc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calc, "posuvník hostů se do kalkulačky nesmí vrátit").not.toContain("calc-guests");
    expect(calc, "posuvník plochy je pryč (patch 142)").not.toContain('id="calc-m2"');
    expect(calc).toContain("result.r.guests");
    expect(calc).toContain("?byt=${location}-${size}-${season}#kalkulacka");
    for (const k of ["calc_guests_1", "calc_guests_2", "calc_range_to", "calc_range_label", "calc_derived_note", "calc_terms_note", "calc_rent_src"]) {
      expect(strip(cs[k]).length).toBeGreaterThan(0);
      expect(strip(vi[k]).length).toBeGreaterThan(0);
    }
  });

  it("nájem v kalkulačce jede na typické ploše dispozice v té čtvrti (Sreality mediány)", () => {
    const rows = readFileSync("data/sreality-2026-08/rents-clean.csv", "utf8").trim().split("\n").slice(1)
      .map((l) => { const [district, layout, area] = l.split(","); return { district, layout, m2: +area }; });
    const MAP: Record<string, string> = { "1+kk": "1kk", "1+1": "1kk", "2+kk": "2kk", "2+1": "2kk", "3+kk": "3kk", "3+1": "3kk", "4+kk": "4kk", "4+1": "4kk" };
    const med = (xs: number[]) => { const a = [...xs].sort((x, y) => x - y); return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2; };
    const cityXs: Record<string, number[]> = {};
    const distXs: Record<string, Record<string, number[]>> = {};
    for (const r of rows) {
      const k = MAP[r.layout]; if (!k) continue;
      (cityXs[k] ??= []).push(r.m2);
      ((distXs[r.district] ??= {})[k] ??= []).push(r.m2);
    }
    for (const [d, sizes] of Object.entries(TYPICAL_AREA)) {
      for (const [k, v] of Object.entries(sizes)) {
        const xs = distXs[d]?.[k] ?? [];
        const expected = xs.length >= 8 ? med(xs) : med(cityXs[k]);
        expect(v, `${d} ${k}`).toBe(Math.round(expected));
      }
    }
    // kalkulačka i graf ji používají; „jinde" padá na celopražský medián MF
    expect(typicalArea("praha1", "2kk")).toBe(65);
    expect(typicalArea("jinde", "2kk")).toBe(MEDIAN_AREA["2kk"]);
    const calc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calc).toContain("typicalArea(location, size)");
    expect(readFileSync("src/lib/horizon.ts", "utf8")).toContain("typicalArea(location, size)");
  });

  it("výsledek je rozpětí (průměr trhu až s Antam) a publikované karty do něj padají", () => {
    // Backtest: skutečné karty proti pásmu čtvrti pro jejich kapacitu. Hlídá,
    // že rozpětí je poctivé: spodek nesmí přestřelit žádnou kartu o víc než
    // 10 % a vršek nesmí být pod žádnou kartou o víc než 20 %.
    const cards: [string, SizeKey, number, number][] = [
      ["praha1", "3kk", 64000, 8], // 402
      ["praha1", "3kk", 57000, 8], // 405
      ["praha3", "2kk", 50000, 6], // Modern AC
      ["praha3", "2kk", 42000, 6], // zahrada
      ["praha5", "1kk", 30000, 4], // Mozart
    ];
    for (const [loc, size, owner, guests] of cards) {
      const r = ownerMonthly(loc, size);
      if (!r.supported) throw new Error(loc);
      expect(r.guests, `${loc} ${size}`).toBe(guests);
      expect(r.low).toBeLessThanOrEqual(r.mid);
      expect(r.mid).toBeLessThanOrEqual(r.high);
      expect(owner / r.low, `${loc} ${size} karta/spodek`).toBeGreaterThan(0.9);
      expect(owner / r.high, `${loc} ${size} karta/vršek`).toBeGreaterThan(0.8);
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
        const d = fiveYear(loc, size, "airbnb");
        if (!r.supported || !d) throw new Error(`${loc} ${size}`);
        // 2. rok (po rozjezdu): měsíční přírůstek = net − energie − obnova
        expect(d.str[24] - d.str[23]).toBeCloseTo((r.mid - d.energy - d.renew) * 1.03, 5);
        expect(d.strMarket[24] - d.strMarket[23]).toBeCloseTo((r.low - d.energy - d.renew) * 1.03, 5);
        expect(d.strHigh[24] - d.strHigh[23]).toBeCloseTo((r.high - d.energy - d.renew) * 1.03, 5);
        expect(d.netMarket).toBe(r.market.net);
        expect(d.rent).toBe(rentFor(loc, size, typicalArea(loc, size), "furnished"));
        expect(d.lt[12] - d.lt[11]).toBeCloseTo(d.rent, 5);
      }
    // teaser se ukazuje jen pro kladný pětiletý rozdíl
    const calcSrc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calcSrc).toContain("d && d.gap > 0 && (");
    const hz = readFileSync("src/components/HorizonSection.tsx", "utf8");
    expect(hz).toContain("d.strMarket");
    expect(hz).toContain("d.strHigh");
    expect(hz).toContain("fiveYear(location, size, furn)");
  });

  it("byt 302 zůstává nepublikovaný, dokud tržní model dává víc než jeho měření", () => {
    // 302 (Praha 1, neveřejný) dává majiteli při 30 % 54 391 Kč. Tržní model
    // P1/2BR dává víc (~60 100), takže 302 na web nepatří; jinak by karta
    // podstřelovala benchmark, který stránka sama ukazuje.
    const MEASURED_302 = 54391;
    const model = net(ownerMonthly("praha1", "3kk")); // 302: 2 ložnice, 8 hostů
    if (model >= MEASURED_302) {
      const src = readFileSync("src/components/PortfolioSection.tsx", "utf8");
      expect(src, "302 je na webu, ale tržní model ho přeslibuje").not.toContain("302");
    }
  });
  it("nájem (rentFor) a energie pokrývají všechny čtvrti a dispozice", () => {
    // Nájemní data (Sreality) pokrývají celou Prahu včetně P10, i čtvrti, kde
    // výnos nepočítáme; jediná funkce na nájem je rentFor.
    for (const key of Object.keys(RENT_INTERCEPT) as (keyof typeof RENT_INTERCEPT)[]) {
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
    // Z panelu kalkulačky krytí zmizelo (patch 142, „jen to důležité"); pravidlo
    // žije v lib/yield a v kopii ho nese garance, ceník a FAQ (testy výš).
    const calc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calc).not.toContain("annualDamageCover");
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
    // 402: 64 000 / rentFor(P1, 52 m²) ≈ 2,3 (Sreality křivka)
    expect(ratioFor("Praha 1", 52, 64000)).toBe(2.3);
    expect(ratioFor("Praha 1", 52, 57000)).toBe(2.0);
    expect(ratioFor("Praha 3", 55, 50000)).toBe(1.8);
    expect(ratioFor("Praha 3", 60, 42000)).toBe(1.4);
    expect(ratioFor("Praha 5", 40, 30000)).toBe(1.5);
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
describe("nájem podle plochy (Sreality 8/2026)", () => {
  const rows = readFileSync("data/sreality-2026-08/rents-clean.csv", "utf8").trim().split("\n").slice(1)
    .map((l) => { const [district, , area, rent] = l.split(","); return { district, m2: +area, rent: +rent }; });

  it("křivka sedí na vyčištěný dataset: sklon i úroveň čtvrtí se dají zreprodukovat", () => {
    expect(rows.length).toBeGreaterThan(1200);
    // úroveň čtvrti = medián log(Kč/m²) − b·log(m²); musí sedět na RENT_INTERCEPT
    const byD = new Map<string, number[]>();
    for (const r of rows) {
      if (!(r.m2 >= 18 && r.rent > 0)) continue;
      const res = Math.log(r.rent / r.m2) - RENT_SLOPE * Math.log(r.m2);
      byD.set(r.district, [...(byD.get(r.district) ?? []), res]);
    }
    const med = (xs: number[]) => { const a = [...xs].sort((x, y) => x - y); return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2; };
    for (const [d, val] of Object.entries(RENT_INTERCEPT)) {
      const xs = byD.get(d);
      expect(xs, d).toBeDefined();
      expect(xs!.length, d).toBeGreaterThanOrEqual(50);
      expect(Math.abs(med(xs!) - val), `${d} intercept`).toBeLessThan(0.005);
    }
  });

  it("Deloitte Rent Index Q2/2026 drží jako kotva: 53 m² v pásmu ±12 %", () => {
    const DELOITTE: Record<LocationKey, number> = {
      praha1: 490, praha2: 482, praha3: 480, praha4: 443, praha5: 461,
      praha6: 454, praha7: 493, praha8: 465, praha9: 468, praha10: 442,
    };
    for (const [d, perM2] of Object.entries(DELOITTE) as [LocationKey, number][]) {
      const ratio = rentFor(d, "2kk", 53) / (53 * perM2);
      expect(ratio, d).toBeGreaterThan(0.88);
      expect(ratio, d).toBeLessThan(1.12);
    }
  });

  it("menší byt má vyšší nájem za m², větší byt vyšší nájem celkem; vybavenost ±", () => {
    for (const d of Object.keys(RENT_INTERCEPT) as LocationKey[]) {
      expect(rentFor(d, "2kk", 45) / 45).toBeGreaterThan(rentFor(d, "2kk", 90) / 90);
      expect(rentFor(d, "2kk", 45)).toBeLessThan(rentFor(d, "2kk", 90));
    }
    expect(FURN_RENT.furnished).toBeGreaterThan(1);
    expect(FURN_RENT.none).toBeLessThan(1);
    expect(FURN_RENT.mix).toBe(1);
    expect(rentFor("praha1", "2kk", 53, "furnished")).toBeGreaterThan(rentFor("praha1", "2kk", 53, "none"));
    // graf Za 5 let bere vybavenost z přepínače
    const hz = readFileSync("src/lib/horizon.ts", "utf8");
    expect(hz).toContain('furn === "prazdny" ? "none" : "furnished"');
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
    expect(pf).toContain("Sreality");
    expect(pf).toContain("Deloitte");
  });
});
