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
  MARKET_STR, MARKET_OCC, SEASONS_BY_LOC, isMeasured, bandFor,
  operatorFactor, OPERATOR_EVIDENCE, publicFactorFrom, AVAILABILITY, BAND_BLEND, bandWeight, bandForSize, ctvrtiOf, MARKET_CTVRT,
  marketOccPct, ratioFor, SIZE_PRESET, SIZE_RATIO, isReliableN, RELIABLE_MIN_N, RECONSTRUCTED_CELLS, SPREAD, SIZE_BUCKETS_BY_VERSION, CALC_MODEL_VERSION, bucketsFor, bucketFor, marketCell, guestsFor, BASE_GUESTS,
  RENT_SLOPE, RENT_INTERCEPT, FURN_RENT, RENT_GROWTH, STR_GROWTH, GEO, geoContext, ctvrtRentFactor, TYPICAL_AREA, typicalArea, type LocationKey,
  type MeasuredLocation, type SizeKey,
} from "@/lib/yield";
import { fiveYear } from "@/lib/horizon";
import { parseShare } from "@/contexts/CalcContext";

/** ownerMonthly vrací supported-flag; testy chtějí číslo, nebo spadnout. */
const net = (r: ReturnType<typeof ownerMonthly>) => {
  if (!r.supported) throw new Error("ownerMonthly: unsupported combination in test");
  return r.antam.net;
};
/** Dispozice, která spadne do daného pásma trhu. */
const sizeOf = (band: string): SizeKey => band === "1BR" ? "1kk" : band === "2BR" ? "2kk" : "4kk";
/** Stejný tvar jako tovární funkce v yield.ts; drží snapshot verze čitelný. */
const B = (id: string, minM2: number | null, maxM2: number | null, representativeM2: number | null) =>
  ({ id, labelKey: `calc_size_${id}`, minM2, maxM2, representativeM2, supported: representativeM2 !== null });

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
    for (const key of ["calc_net_sub", "calc_excluded_note", "faq5_a", "faq9_a", "report_row_costs"]) {
      expect(strip(cs[key]), `cs.${key}`).toMatch(/30\s?%/);
      expect(strip(vi[key]), `vi.${key}`).toMatch(/30\s?%/);
    }
    // QA-09 (1. 9. 2026): faq17_a už sazbu neuvádí — poslední věta („V odměně
    // 30 % je i písemné roční minimum a krytí menších škod") jen opakovala dvě
    // karty přímo nad sebou. Sazba zůstává v otázce, tak ji hlídáme tam.
    expect(strip(cs.faq17_q), "cs.faq17_q").toMatch(/30\s?%/);
    expect(strip(vi.faq17_q), "vi.faq17_q").toMatch(/30\s?%/);
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

  // QA-03 (1. 9. 2026): roční strop 20 000 Kč na drobné opravy VOP neobsahují.
  // Článek IV.2 zná jen limit 5 000 Kč na jeden případ ("Drobné opravy a údržbu
  // do 5 000 Kč zajistí Správce bez předchozího souhlasu Vlastníka; opravy nad
  // 5 000 Kč Správce předem oznámí"). Test proto hlídá obojí: že pravidlo na
  // případ na webu je, a že roční strop, který smlouva nekryje, nikde není.
  it("drobné opravy: 5 000 Kč na případ, žádný roční strop navíc", () => {
    expect(strip(cs.faq5_a)).toMatch(/5 000 Kč/);
    expect(strip(vi.faq5_a)).toMatch(/5 000 Kč/);
    expect(strip(cs.faq5_a)).toMatch(/po vašem souhlasu/);
    for (const [lang, dict] of [["cs", cs], ["vi", vi]] as const) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== "string") continue;
        expect(strip(value), `${lang}.${key}`).not.toMatch(/nejvýše 20 000 Kč za rok|cả năm không quá 20 000 Kč/);
      }
    }
  });

  // QA-02 (1. 9. 2026): VOP čl. VI.1 zná jen výpovědní lhůtu 4 měsíce, žádné
  // okamžité odstoupení při nedosažení minima. Dokud to nepotvrdí konkrétní
  // Smlouva o správě, nesmí se to objevit ani ve FAQ, ani v sekci Garance.
  it("neslibuje okamžitý odchod, který VOP nekryjí", () => {
    for (const [lang, dict] of [["cs", cs], ["vi", vi]] as const) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== "string") continue;
        expect(strip(value), `${lang}.${key}`).not.toMatch(/okamžitě odejít|okamžité odstoupení|rời ngay lập tức/);
      }
    }
  });

  // QA-01 (1. 9. 2026): viditelný lead ceníku nesmí působit, že jednorázové
  // uvedení do provozu neexistuje. 25 000 Kč je v pr2_price; od 1. 9. i nahoře.
  it("viditelný lead ceníku přiznává jednorázové uvedení do provozu", () => {
    expect(strip(cs.pricing_desc)).toMatch(/25 000 Kč/);
    expect(strip(cs.pricing_desc)).not.toMatch(/[Žž]ádné fixní/);
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

  // PŘEPSÁNO 2C (1. 9. 2026). Do té doby test vyžadoval JEDEN identický popisek
  // na heru, kalkulačce, garanci, postupu i sticky liště. To bylo vědomé
  // rozhodnutí a teď se vědomě obrací: osm tlačítek se stejným textem vedlo na
  // TŘI různé cíle (#kalkulacka, #kontakt, odeslání formuláře), takže popisek
  // přestal nést informaci. Nově se hlídá CHOVÁNÍ a fáze trychtýře, ne shoda
  // řetězců: před číslem se mluví o potenciálu, po něm o posouzení bytu,
  // v chromu je krátká neutrální akce.
  it("CTA se liší podle fáze trychtýře, ne jedním popiskem pro všechno", () => {
    // Hero je JEDINÉ místo před číslem: vede do kalkulačky, ne na formulář.
    expect(cs.hero_cta).not.toBe(cs.calc_cta);
    expect(cs.hero_cta).not.toBe(cs.contact_submit);
    // Chrome (navbar + sticky) je krátká neutrální akce a je konzistentní.
    expect(cs.nav_freeConsultation).toBe(cs.mobile_cta);
    expect(cs.nav_freeConsultation).not.toBe(cs.hero_cta);
    // Po čísle jedna slovní zásoba: garance i postup vedou na stejný krok.
    expect(cs.g_cta).toBe(cs.process_cta);
    // Odeslání formuláře nesmí mít stejný text jako lišta, která z formuláře vede pryč.
    expect(cs.contact_submit).not.toBe(cs.mobile_cta);
    // Závěr stránky se neptá znovu na otázku, kterou zodpověděla kalkulačka.
    expect(cs.final_title).not.toBe(cs.calc_title1 + cs.calc_title2);
    // Žádný popisek nesmí zůstat prázdný.
    for (const k of ["hero_cta", "calc_cta", "g_cta", "process_cta", "contact_submit", "mobile_cta", "nav_freeConsultation"] as const)
      expect(String(cs[k]).trim().length, `cs.${k}`).toBeGreaterThan(0);
    // Vietnamština má vlastní odstupňování už od 2A; drží se jen to, že se
    // hero a formulář neshodují.
    expect(vi.hero_cta).not.toBe(vi.contact_submit);
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
    // Disclaimer NESMÍ popisovat model, který web nepočítá. Zrušeno 31. 8. 2026:
    // starý mechanismus „obsazenost trhu +15 %, strop 85 %" (nahrazen naměřeným
    // operátorským faktorem) a staré mapování „pásmo = počet ložnic dispozice"
    // (pásmo se bere z dispozice A plochy). Ani jedno se nesmí vrátit, ani do
    // nápovědy u posuvníku. Zároveň se ven nepouštějí interní kalibrační detaily
    // (počet kalibračních bytů, okno dat, naše obsazenost, naše ADR proti trhu).
    // Sweep přes VŠECHNY texty obou jazyků, ne jen přes disclaimer: zrušená
    // formulace se naposledy schovala v klíči calc_basis, který nic
    // nerenderovalo, ale pořád se dostával do bundlu.
    for (const [lang, dict] of [["cs", cs], ["vi", vi]] as const) {
      for (const [key, raw] of Object.entries(dict)) {
        if (typeof raw !== "string") continue;
        const text = strip(raw);
        expect(text, `${lang}.${key}: zrušený occupancy uplift`).not.toMatch(/zvednut|nejvýš 85|cộng 15|tối đa 85/i);
        expect(text, `${lang}.${key}: naše obsazenost ven nepatří`).not.toMatch(/85 až 97|85 đến 97/);
        expect(text, `${lang}.${key}: staré mapování pásma na ložnice`).not.toMatch(/určuje počet ložnic|lấy theo số phòng ngủ/i);
        // Rozpětí NENÍ příběh o obsazenosti: oba konce jedou na tržní obsazenosti
        // (yield.ts dává split() u obou variant tentýž marketOcc). Liší se vahou
        // překlopení do vyššího pásma a operátorským faktorem.
        expect(text, `${lang}.${key}: rozpětí se nesmí vysvětlovat obsazeností`)
          .not.toMatch(/naši obsazenost|naše obsazenost|podle obsazenosti|kín phòng của Antam|tùy mức kín phòng/i);
        expect(text, `${lang}.${key}: kapacita není veřejné tvrzení`).not.toMatch(/počet hostů|kolik hostů|mấy khách|số khách/i);
        // Nástroje smí zaznít jinde (svc_systems: „jedeme na Hospitable a PriceLabs"),
        // ale v copy KALKULAČKY se model nevysvětluje přes interní kalibraci.
        if (key.startsWith("calc_"))
          expect(text, `${lang}.${key}: interní kalibrace ven nepatří`).not.toMatch(/PriceLabs|jedenácti|mười một|Deloitte/i);
      }
      // co v disclaimeru naopak zůstat MUSÍ
      const d = strip(dict.calc_disclaimer);
      expect(d, `${lang}: rámec „orientační, ne nabídka"`).toMatch(/orientační|tham khảo/i);
      expect(d, `${lang}: provize platforem`).toMatch(/17/);
    }
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
        // Dvě různá n, každé na jinou otázku, obě ověřená proti surové řadě.
        const al = r.active_listings as number[];
        expect(cell.nMean, `${loc} ${band} nMean`).toBe(Math.round(al.reduce((a: number, b: number) => a + b, 0) / al.length));
        expect(cell.nMin, `${loc} ${band} nMin`).toBe(Math.min(...al));
        // JEDINÉ pravidlo spolehlivosti: práh se aplikuje na nMin, ne na nMean.
        expect(isReliableN(cell.nMin), `${loc} ${band} musí projít bránou`).toBe(true);
      }
    }
    // A OPAČNĚ: každá buňka, která v MARKET_STR chybí, musí bránou opravdu
    // propadnout. Bez toho by šlo cell tiše vynechat a nikdo by si nevšiml.
    for (const loc of Object.keys(MARKET_STR) as MeasuredLocation[]) {
      const raw = JSON.parse(readFileSync(`data/pricelabs-2026-08/${loc}.json`, "utf8"));
      for (const band of ["1BR", "2BR", "3BR"] as const) {
        if (MARKET_STR[loc][band]) continue;
        const al = raw[band].active_listings as number[];
        expect(isReliableN(Math.min(...al)), `${loc} ${band} chybí, ale prošlo by bránou`).toBe(false);
      }
    }
    expect(MARKET_STR.praha3["3BR"]).toBeUndefined();
    expect(MARKET_STR.praha9["2BR"]).toBeUndefined();
    expect(MARKET_STR.praha4["3BR"]).toBeUndefined();
    // Buňky bez surového artefaktu musí být PŘIZNANÉ, ne jen tiše bez nMin.
    for (const [id, c] of Object.entries(MARKET_CTVRT))
      for (const [band, cell] of Object.entries(c.bands))
        if (cell.nMin === null)
          expect(RECONSTRUCTED_CELLS[id], `${id} ${band}: nMin chybí a není přiznané`).toBeTruthy();
  });

  it("kapacitu majitel nezadává: odvodí se z dispozice a plochy a určí pásmo trhu (tři vstupy)", () => {
    expect(BASE_GUESTS).toEqual({ "1kk": 4, "2kk": 6, "3kk": 8, "4kk": 10 });
    for (const k of ["1kk", "2kk", "3kk", "4kk"] as const) expect(guestsFor(k)).toBe(BASE_GUESTS[k]);
    expect(bandFor(4)).toBe("1BR");
    expect(bandFor(5)).toBe("2BR");
    expect(bandFor(8)).toBe("2BR");
    expect(bandFor(9)).toBe("3BR");
    // Od 31. 8. 2026 rozhoduje o pásmu dispozice A plocha, ne kapacita samotná:
    // 2+kk se mezi 40 a 55 m² překlápí z 1BR do 2BR. Kalibrováno na vlastních
    // bytech (Mozart 40 m² pro 4 = 1BR, Čelakovského 52 m² pro 8 = 2BR,
    // Modern AC 55 m² pro 6 = 2BR).
    expect(BAND_BLEND["2kk"]).toEqual({ base: "1BR", next: "2BR", lo: 40, hi: 55 });
    expect(bandWeight("2kk", 40)).toBe(0);
    expect(bandWeight("2kk", 55)).toBe(1);
    expect(bandForSize("2kk", 40)).toBe("1BR");
    expect(bandForSize("2kk", 52)).toBe("2BR");
    const r = ownerMonthly("praha3", "2kk", { m2: 55 });
    expect(r.supported && r.band).toBe("2BR");
    expect(r.supported && r.guests).toBe(6);
    const calc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calc, "posuvník hostů se do kalkulačky nesmí vrátit").not.toContain("calc-guests");
    // Velikost se vybírá TLAČÍTKY, ne posuvníkem na jeden metr (31. 8. 2026).
    // Kbelík je jen vstupní rozhraní: pošle reprezentativní plochu do TÉHOŽ modelu.
    expect(calc, "posuvník plochy se nesmí vrátit").not.toContain('type="range"');
    expect(calc, "velikost se vybírá tlačítky").toContain('id="calc-size"');
    for (const size of ["1kk", "2kk", "3kk", "4kk"] as const) {
      const bs = bucketsFor(size);
      expect(bs.length, `${size}: tři velikosti + individuální`).toBe(4);
      expect(bs[0].minM2, `${size}: první kbelík je otevřený dolů`).toBe(null);
      expect(bs[3].representativeM2, `${size}: poslední se NEEXTRAPOLUJE`).toBe(null);
      expect(bs[3].maxM2, `${size}: poslední je otevřený nahoru`).toBe(null);
      // kbelíky na sebe navazují bez děr a bez překryvu
      for (let i = 1; i < bs.length; i++) expect(bs[i].minM2, `${size} #${i}`).toBe((bs[i - 1].maxM2 as number) + 1);
      // reprezentativní plocha leží uvnitř svého kbelíku
      for (const b of bs.slice(0, 3)) {
        expect(b.representativeM2!).toBeGreaterThanOrEqual(b.minM2 ?? 0);
        expect(b.representativeM2!).toBeLessThanOrEqual(b.maxM2 as number);
        expect(bucketFor(size, b.representativeM2!).id, `${size}: ${b.representativeM2} padne zpět`).toBe(b.id);
      }
    }
    // Kde dispozice překlápí pásmo, dělí se PŘESNĚ na lo/hi z BAND_BLEND:
    // tam se opravdu mění komerční produkt, jinde by to byla náhodná čísla.
    for (const size of ["2kk", "3kk"] as const) {
      const b = BAND_BLEND[size];
      expect(bucketsFor(size)[0].maxM2, `${size}: první hranice = lo překlopení`).toBe(b.lo);
      expect(bucketsFor(size)[1].maxM2, `${size}: druhá hranice = hi překlopení`).toBe(b.hi);
    }
    // Tlačítka musí dávat ROZLIŠITELNÁ čísla, jinak je to jen hezčí UI.
    for (const size of ["2kk", "3kk"] as const) {
      const [s1, s2, s3] = bucketsFor(size).slice(0, 3).map((b) => {
        const r = ownerMonthly("praha1", size, { m2: b.representativeM2! });
        return r.supported ? r.high : 0;
      });
      expect(s2, `${size}: běžný > menší`).toBeGreaterThan(s1);
      expect(s3, `${size}: větší > běžný`).toBeGreaterThan(s2);
    }
    // Atypicky velký byt nesmí dostat hlášku o chybějících datech LOKALITY.
    expect(calc, "vlastní panel pro atypickou velikost").toContain("calc_oversized_title");
    for (const d of [cs, vi]) {
      expect(strip(d.calc_oversized_title).length).toBeGreaterThan(10);
      expect(strip(d.calc_oversized_text).length).toBeGreaterThan(30);
      expect(strip(d.calc_oversized_title), "nemluví o lokalitě").not.toMatch(/lokalit|khu này/i);
    }
    // (10) V komponentě NESMÍ být žádná hranice velikosti natvrdo. Všechno se
    // skládá z verzované konfigurace, jinak by se tlačítka s novou verzí modelu
    // rozešla s tím, co se opravdu počítá.
    expect(calc, "tlačítka se renderují z konfigurace").toContain("bucketsFor(size)");
    expect(calc, "žádná plocha natvrdo v JSX").not.toMatch(/\d+\s*m²/);
    // Skenuje se JEN kód, ne komentáře a ne třídy Tailwindu (ty nesou 50, 65, 80
    // jako krytí barvy, ne jako metry). Zbyde to, co komponenta opravdu počítá.
    const code = calc
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/className=(?:"[^"]*"|\{`[^`]*`\})/g, "")
      .replace(/text-\[[^\]]*\]/g, "");
    const allEdges = new Set<number>();
    for (const v of Object.values(SIZE_BUCKETS_BY_VERSION))
      for (const bs of Object.values(v))
        for (const b of bs) [b.minM2, b.maxM2, b.representativeM2].forEach((x) => x !== null && allEdges.add(x));
    for (const e of allEdges)
      expect(code, `hranice ${e} nesmí být v komponentě natvrdo`).not.toMatch(new RegExp(`[^\\w.-]${e}[^\\w.%-]`));
    // a nesahá si na konfiguraci přímo, jde přes bucketsFor(version)
    expect(calc, "komponenta nečte verze napřímo").not.toContain("SIZE_BUCKETS_BY_VERSION");

    // (5+6) Verze se nese k leadu, aby šlo zrekonstruovat, co majitel viděl.
    expect(calc).toContain("CALC_MODEL_VERSION");
    expect(calc).toContain("size_bucket_id");
    expect(calc).toContain("representative_m2");
    expect(calc).toContain("bucket_label");
    const contactSrc = readFileSync("src/components/ContactSection.tsx", "utf8");
    for (const f of ["calc_model_version", "calc_inputs", "calc_result", "size_bucket_id", "representative_m2", "bucket_label"])
      expect(contactSrc, `lead musí nést ${f}`).toContain(f);

    // (5) Historická verze se NEPŘEPISUJE. Když někdo změní obsah 2026-08-31.1,
    // spadne tohle a připomene, že má přidat NOVOU verzi.
    expect(CALC_MODEL_VERSION).toBe("2026-08-31.1");
    expect(SIZE_BUCKETS_BY_VERSION["2026-08-31.1"]).toEqual({
      "1kk": [B("s", null, 30, 28), B("m", 31, 40, 35), B("l", 41, 49, 45), B("xl", 50, null, null)],
      "2kk": [B("s", null, 40, 38), B("m", 41, 55, 50), B("l", 56, 80, 63), B("xl", 81, null, null)],
      "3kk": [B("s", null, 65, 63), B("m", 66, 95, 78), B("l", 96, 120, 106), B("xl", 121, null, null)],
      "4kk": [B("s", null, 93, 85), B("m", 94, 132, 116), B("l", 133, 151, 142), B("xl", 152, null, null)],
    });
    // (9) Kbelík nesmí nikde nést ani odvozovat počet osob.
    for (const v of Object.values(SIZE_BUCKETS_BY_VERSION))
      for (const bs of Object.values(v))
        for (const b of bs) expect(Object.keys(b).join(","), "kbelík nekóduje kapacitu").not.toMatch(/guest|host|capac|osob/i);

    for (const k of ["calc_size_s", "calc_size_m", "calc_size_l", "calc_size_xl", "calc_size_upto", "calc_size_over"]) {
      expect(strip(cs[k]).length).toBeGreaterThan(0);
      expect(strip(vi[k]).length).toBeGreaterThan(0);
    }
    // Značka poskytovatele dat nepatří do headline výsledku (31. 8. 2026); zdroj
    // zůstává v metodice pod výsledkem.
    expect(calc, "PriceLabs pryč z veřejného řádku s cenou za noc").not.toContain("PriceLabs");
    // Čtvrť mění číslo, takže se musí ve shrnutí výsledku objevit.
    expect(calc, "čtvrť se echuje ve shrnutí").toContain("result.ctvrtLabel");
    // Násobek proti nájmu smí být "× více" jen tam, kde po zaokrouhlení VÍC než 1×.
    // Web dřív psal i "přibližně 0,8× více" (Praha 4, 2+kk, 85 m²): nesmysl a navíc
    // tvrzení o nižším výnosu hned vedle slibu garance.
    expect(calc, "násobek jen nad 1×").toContain("const betterThanLtr = result.ratio > 0 && ratioRounded > 1;");
    // Násobek i Kč/rok pod TOUŽ podmínkou. Do 1. 9. 2026 měly každá svou
    // (`> 1` proti `high > ltr`), takže u 8 z 832 kombinací stránka tvrdila
    // „nájem vychází podobně nebo výše" a zároveň „+9 000 Kč ročně navíc".
    expect(calc, "Kč/rok pod touž podmínkou jako násobek")
      .not.toContain("result.r.high > result.ltr &&");
    expect((calc.match(/betterThanLtr/g) ?? []).length, "jedna podmínka, dvě použití")
      .toBeGreaterThanOrEqual(3);
    // Headline = dosažitelný vršek už spočítaného rozpětí, ne jeho střed. Rozpětí
    // musí zůstat vidět hned pod ním: featuruje se jiný bod, nejistota se neschovává.
    expect(calc, "headline je vršek rozpětí").toContain("result.r.high / 1000");
    expect(calc, "headline NENÍ střed").not.toContain("result.r.mid / 1000");
    // OTOČENO 1. 9. 2026: veřejné rozpětí se přestalo renderovat, výsledek je
    // JEDNO číslo. Assertion proto hlídá opak — a hlavně to, že se rozpětí
    // nenahradilo jinou formou nejistoty ani nezmizelo zpod povrchu.
    expect(calc, "veřejné rozpětí se nerenderuje").not.toContain("calc_range_label");
    expect(calc, "ani jeho druhý konec").not.toContain("calc_range_to");
    for (const d of [cs, vi]) {
      expect(d.calc_range_label, "mrtvý klíč pryč z překladů").toBeUndefined();
      expect(d.calc_range_to, "mrtvý klíč pryč z překladů").toBeUndefined();
    }
    // Žádná náhradní vizualizace nejistoty (rozhodnutí 1. 9. 2026).
    for (const d of [cs, vi]) {
      for (const [k, v] of Object.entries(d)) {
        if (!k.startsWith("calc_")) continue;
        expect(v, `${k}: žádné „od X" / „až X" jako náhrada rozpětí`)
          .not.toMatch(/\bod\s+\{|\baž\s+\{|khoảng\s+\{/);
      }
    }
    // low/high MUSÍ přežít pod povrchem: v modelu, ve stopě, v leadu, v grafu i v MCP.
    expect(calc, "low jde do leadu").toContain("owner_low: result.r.supported ? result.r.low");
    expect(calc, "high jde do leadu").toContain("owner_high: result.r.supported ? result.r.high");
    expect(readFileSync("src/lib/horizon.ts", "utf8"), "graf dál čte oba konce")
      .toContain("const netMarket = year.low;");
    expect(readFileSync("src/lib/mcp/tools/estimate-yield.ts", "utf8"), "MCP dál vrací oba konce")
      .toMatch(/czk\(r\.low\)[\s\S]*czk\(r\.high\)/);
    expect(calc, "násobek jde z čísla v headline").toContain("r.high / ltr");
    for (const d of [cs, vi]) expect(strip(d.calc_net)).toMatch(/[Pp]otenciál|[Tt]iềm năng/);
    expect(calc, "a jinak poctivá věta").toContain("calc_ltr_higher");
    for (const d of [cs, vi]) expect(strip(d.calc_ltr_higher).length).toBeGreaterThan(10);
    // Benefit v Kč/rok vedle násobku, jen když je rozdíl kladný.
    expect(calc, "Kč za rok pod headline").toContain("(result.r.high - result.ltr) * 12");
    expect(calc).toContain("calc_vs_ltr_year");
    for (const d of [cs, vi]) expect(strip(d.calc_vs_ltr_year).length).toBeGreaterThan(10);
    expect(calc, "a bere se z trace, ne ze stavu").toContain("r.supported ? r.trace.ctvrt : null");
    // Formát odkazu se NEMĚNÍ (okres-čtvrť-dispozice-Xm-sezóna), mění se jen
    // to, které m² se u „ještě většího" bytu posílá: spodní hranice kbelíku
    // místo typické plochy okresu, aby se sdílený oversized stav neotevřel
    // příjemci jako normální kbelík s číslem.
    expect(calc).toContain('?byt=${location}-${ctvrt ?? "-"}-${size}-${shareM2}m-${season}#kalkulacka');
    expect(calc, "oversized se sdílí jako oversized")
      .toContain("const shareM2 = oversized ? (bucketsFor(size).find((b) => b.id === bucket)?.minM2 ?? m2) : m2;");
    // A opačně: čtení odkazu nesmí brát zděděné klíče Object.prototype jako čtvrť.
    const ctx = readFileSync("src/contexts/CalcContext.tsx", "utf8");
    expect(ctx, "čtvrť z odkazu přes hasOwn, ne `in`").toContain("Object.hasOwn(MARKET_CTVRT, p)");
    expect(ctx, "`in` by chytlo i constructor/toString").not.toContain("p in MARKET_CTVRT");
    // Bez komentářů: varovná poznámka v CalcContext ten vzorec cituje schválně.
    const ctxCode = ctx.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(ctxCode, "null se nesmí srovnat na undefined").not.toContain("initial?.ctvrt ?? undefined");
    expect(ctxCode, "tři stavy čtvrti se drží").toContain("initial ? initial.ctvrt : undefined");
    // Kapacita NENÍ veřejné tvrzení (rozhodnutí 31. 8. 2026). Počet lůžek závisí
    // na proporcích pokojů, ne na celkových m²; z jednoho čísla se tvrdit nedá.
    // Model ji používá jen jako důvod pro mísení pásma, web ji neukazuje nikde:
    // ani v kalkulačce, ani v grafu, ani v textu, který jde do poptávky.
    const horizon = readFileSync("src/components/HorizonSection.tsx", "utf8");
    const contact = readFileSync("src/components/ContactSection.tsx", "utf8");
    for (const [name, src] of [["kalkulačka", calc], ["graf Za 5 let", horizon], ["poptávka", contact]] as const) {
      expect(src, `${name} nesmí tvrdit kapacitu`).not.toContain("calc_guests");
      expect(src, `${name} nesmí tvrdit kapacitu`).not.toMatch(/\.guests\b/);
      expect(src, `${name}: žádné „hostů" ani „khách" v textu`).not.toMatch(/hostů|khách/);
    }
    for (const k of ["calc_guests_1", "calc_guests_2"]) {
      expect(cs[k], `${k} má být z překladů pryč`).toBeUndefined();
      expect(vi[k], `${k} má být z překladů pryč`).toBeUndefined();
    }
    // MCP počítá s TOUŽ plochou jako web: m² rozhoduje o pásmu, ne jen o nájmu.
    const mcp = readFileSync("src/lib/mcp/tools/estimate-yield.ts", "utf8");
    expect(mcp, "MCP musí předat m² do ownerMonthly").toContain("{ season: seasonKey, m2 }");
    expect(mcp, "a označit dopočítanou plochu").toContain("floorAreaAssumed");
    // MCP kapacitu nevrací ze stejného důvodu jako web: LLM by orientační číslo
    // podalo majiteli jako tvrdý fakt. Zůstává jen floorAreaAssumed.
    expect(mcp, "MCP nesmí vracet kapacitu").not.toContain("assumedGuests");
    expect(mcp, "ani ji psát v textu").not.toMatch(/assumed \$\{guests\}|guests, band/);
    expect(mcp, "guestsFor v MCP nástroji nemá co dělat").not.toContain("guestsFor");
    const bundle = readFileSync("supabase/functions/mcp/index.ts", "utf8");
    expect(bundle, "ani v vygenerovaném bundlu").not.toContain("assumedGuests");
    for (const k of ["calc_derived_note", "calc_terms_note", "calc_rent_src"]) {
      expect(strip(cs[k]).length).toBeGreaterThan(0);
      expect(strip(vi[k]).length).toBeGreaterThan(0);
    }
  });

  it("sdílený odkaz zachová „Ostatní Praha X“ jako vědomou volbu, ne jako nezodpovězeno", () => {
    // Čtvrť má TŘI stavy a odkaz musí rozlišit všechny tři. Do 1. 9. 2026 se
    // „Ostatní Praha 1“ serializovalo do „-“, ale při čtení spadlo na undefined,
    // takže Share na PLATNÝ výsledek poslal příjemci „Vyberte prosím lokalitu“.
    const shared = parseShare("praha1---2kk-63m-year");
    expect(shared).not.toBeNull();
    expect(shared!.ctvrt, "„-“ = Ostatní, tedy null").toBeNull();
    expect(shared!.ctvrt, "a rozhodně ne undefined").not.toBeUndefined();
    expect(shared!.location).toBe("praha1");
    expect(shared!.size).toBe("2kk");
    expect(shared!.m2).toBe(63);
    expect(shared!.season).toBe("year");

    // undefined zůstává vyhrazené pro „krok nezodpovězen“: starý odkaz bez slotu.
    expect(parseShare("praha2-2kk-year")!.ctvrt, "starý odkaz = nezodpovězeno").toBeUndefined();
    // vybraná čtvrť se pořád čte jako čtvrť
    expect(parseShare("praha1-stare_mesto-2kk-63m-year")!.ctvrt).toBe("stare_mesto");
    // zděděné klíče Object.prototype nejsou čtvrť (a nesmí shodit stránku)
    for (const junk of ["constructor", "toString", "valueOf", "hasOwnProperty"]) {
      expect(parseShare(`praha1-${junk}-2kk-63m-year`)!.ctvrt, `${junk} není čtvrť`).toBeUndefined();
    }
    expect(parseShare(null)).toBeNull();

    // A hlavně: obnovený stav musí dát TOTÉŽ číslo jako přímá volba „Ostatní“.
    const fromLink = ownerMonthly("praha1", "2kk", { m2: 63, ctvrt: shared!.ctvrt, season: "year" });
    const direct = ownerMonthly("praha1", "2kk", { m2: 63, ctvrt: null, season: "year" });
    expect(fromLink.supported, "obnovený odkaz je podporovaný výsledek").toBe(true);
    expect(fromLink).toEqual(direct);
    expect(rentFor("praha1", "2kk", 63, "mix", shared!.ctvrt ?? undefined))
      .toBe(rentFor("praha1", "2kk", 63, "mix", null ?? undefined));
  });

  it("3+kk se s plochou plynule překlápí do 3BR (HEURISTIC, oprava konzistence)", () => {
    // Posunuto 31. 8. 2026 z 75–100 na 65–95. NENÍ to změřená kalibrace: pro
    // 3+kk nemáme vlastní byt s historií. Je to srovnání s prahem u 2+kk,
    // který změřený je: typický 2+kk okresu ležel na váze 0,87–1,00, typický
    // 3+kk na 0,20–0,64 a v Praze 9 na 0,00. Střed 80 m² = medián typické
    // plochy 3+kk přes okresy. Kapacita do peněz vstupuje JEN takhle, přes
    // volbu a mísení pásma; žádný násobitel za hosty ani za m² navíc.
    expect(BAND_BLEND["3kk"]).toEqual({ base: "2BR", next: "3BR", lo: 65, hi: 95 });
    expect(bandWeight("3kk", 65)).toBe(0);
    expect(bandWeight("3kk", 80)).toBeCloseTo(0.5, 3);
    expect(bandWeight("3kk", 95)).toBe(1);
    expect(bandForSize("3kk", 79)).toBe("2BR");
    expect(bandForSize("3kk", 80)).toBe("3BR");
    // váha roste s plochou a nikdy nevyleze z <0,1>
    let prev = -1;
    for (let m2 = 50; m2 <= 115; m2++) {
      const w = bandWeight("3kk", m2);
      expect(w, `${m2} m²`).toBeGreaterThanOrEqual(prev);
      expect(w, `${m2} m²`).toBeLessThanOrEqual(1);
      prev = w;
    }
    // typický 3+kk okresu leží nově kolem poloviny překlopení, ne na nule
    expect(bandWeight("3kk", typicalArea("praha9", "3kk"))).toBeGreaterThan(0);
    expect(bandWeight("3kk", typicalArea("praha5", "3kk"))).toBeCloseTo(0.5, 2);
    // veřejná kalkulačka se na kapacitu neptá a neukazuje ji jako číslo z m²
    const calc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    expect(calc, "posuvník hostů se do kalkulačky nesmí vrátit").not.toContain("calc-guests");
  });

  it("3+kk nikdy nevydělá míň než 2+kk stejné plochy (invariant je na STŘEDU)", () => {
    // Invariant platí na středu odhadu. Spodek ani vršek monotonní být nemusí:
    // u dopočítaného pásma se rozpětí záměrně rozšiřuje (SPREAD.derivedWiden),
    // takže vršek 2+kk může přerůst vršek 3+kk, aniž by byl model špatně.
    for (const loc of Object.keys(MARKET_STR) as MeasuredLocation[])
      for (let m2 = 50; m2 <= 115; m2++) {
        const a = ownerMonthly(loc, "2kk", { m2 });
        const b = ownerMonthly(loc, "3kk", { m2 });
        if (!a.supported || !b.supported) throw new Error(`${loc} ${m2}`);
        expect(b.mid, `${loc} ${m2} m²`).toBeGreaterThanOrEqual(a.mid);
      }
  });

  it("dopočítané pásmo rozšiřuje rozpětí přesně o SPREAD.derivedWiden", () => {
    // Nejistota musí být na výstupu vidět: kde se pásmo dopočítává, je rozpětí
    // širší. Tohle je i pojistka proti tomu, aby se widening aplikoval dvakrát.
    const width = (r: ReturnType<typeof ownerMonthly>) => {
      if (!r.supported) throw new Error("unsupported");
      return (r.antam.gross - r.market.gross) / ((r.antam.gross + r.market.gross) / 2);
    };
    const solid = ownerMonthly("praha1", "4kk", { m2: 105 });   // P1 3BR je změřené
    const derived = ownerMonthly("praha9", "4kk", { m2: 105 }); // P9 3BR se dopočítává
    expect(solid.supported && solid.derived).toBe(false);
    expect(derived.supported && derived.derived).toBe(true);
    expect(width(solid)).toBeCloseTo(SPREAD.high - SPREAD.low, 3);
    expect(width(derived)).toBeCloseTo((SPREAD.high - SPREAD.low) * SPREAD.derivedWiden, 3);
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
    // typicalArea zůstává jako VÝCHOZÍ hodnota posuvníku a záloha, ne jako vstup výpočtu
    expect(readFileSync("src/contexts/CalcContext.tsx", "utf8")).toContain("typicalArea(loc0, size0)");
    expect(readFileSync("src/lib/horizon.ts", "utf8")).toContain("m2Input ?? typicalArea(location, size)");
  });

  it("výsledek je rozpětí (průměr trhu až s Antam) a publikované karty do něj padají", () => {
    // Backtest: skutečné karty proti pásmu jejich lokality. Hlídá, že rozpětí
    // je poctivé: spodek nesmí přestřelit žádnou kartu o víc než 10 % a vršek
    // nesmí být pod žádnou kartou o víc než 20 %.
    //
    // Dispozice A plocha jsou SKUTEČNÉ (PortfolioSection), ne zástupné. Do
    // 31. 8. 2026 tu Čelakovského 402 a 405 stály jako "3kk" a Mozart jako
    // "1kk" — to byla zástupka za komerční pásmo, ne fyzická dispozice, a
    // pletla dvě různé věci dohromady. Fyzicky jsou to 2+kk o 52 m² a 2+kk
    // o 40 m². Počet hostů se tu nekontroluje: kapacita je důvod, proč se
    // pásmo mísí, ale veřejný model ji nezobrazuje ani neverifikuje.
    const cards: [string, SizeKey, number, number][] = [
      ["praha1", "2kk", 52, 64000], // Čelakovského 402
      ["praha1", "2kk", 52, 57000], // Čelakovského 405
      ["praha3", "2kk", 55, 50000], // Modern AC
      ["praha3", "2kk", 60, 42000], // Moderní apartmán se zahradou
      ["praha5", "2kk", 40, 30000], // My Mozart studio
    ];
    for (const [loc, size, m2, owner] of cards) {
      const r = ownerMonthly(loc, size, { m2 });
      if (!r.supported) throw new Error(loc);
      expect(r.low).toBeLessThanOrEqual(r.mid);
      expect(r.mid).toBeLessThanOrEqual(r.high);
      expect(owner / r.low, `${loc} ${size} ${m2} m² karta/spodek`).toBeGreaterThan(0.9);
      expect(owner / r.high, `${loc} ${size} ${m2} m² karta/vršek`).toBeGreaterThan(0.8);
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
    // měřené buňky nejsou derived, dopočítané ano; od 31. 8. 2026 se poměry
    // NEŘETĚZÍ: P9 3BR se bere přímým poměrem 3BR/1BR z jediného spolehlivého
    // pásma čtvrti, ne přes mezikrok 2BR
    expect(marketCell("praha1", "3BR")!.derived).toBe(false);
    expect(marketCell("praha3", "3BR")!.derived).toBe(true);
    expect(marketCell("praha3", "3BR")!.adr).toBe(Math.round(MARKET_STR.praha3["2BR"]!.adr * SIZE_RATIO["3BR/2BR"].adr));
    expect(marketCell("praha9", "2BR")!.derived).toBe(true);
    expect(marketCell("praha9", "3BR")!.adr).toBe(Math.round(MARKET_STR.praha9["1BR"]!.adr * SIZE_RATIO["3BR/1BR"].adr));
    expect(SIZE_RATIO["3BR/1BR"].adr, "přímý poměr, ne součin sousedních")
      .not.toBeCloseTo(SIZE_RATIO["2BR/1BR"].adr * SIZE_RATIO["3BR/2BR"].adr, 3);
    const r = ownerMonthly("praha4", "4kk", { m2: 105 });
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

  it("efekt Antam je naměřený poměr tržby, ne zvednutá obsazenost", () => {
    // Přestavěno 31. 8. 2026 po rekonciliaci jedenácti vlastních bytů proti
    // PriceLabs. Starý model (obsazenost × 1,15, strop 85 %, na plné tržní ADR)
    // popisoval kombinaci, která u nás nenastává: obsazenost opravdu jede
    // 92–96 %, ale za 63–77 % tržního ADR. Čistý poměr tržby proti průměru
    // trhu vyšel 0,99 v Praze 1, 1,21 v Praze 3 a 1,08 v Praze 5.
    // Veřejně jde do centra 0,95, aby veřejné číslo bylo spíš pod skutečností.
    // Veřejný faktor se od 31. 8. 2026 ODVOZUJE z měření, nezapisuje se ručně:
    // nepříznivé měření se bere celé, příznivé se krátí k výchozí 1,10 podle
    // váhy vzorku. Asymetrie je záměrná veřejná opatrnost, ne statistika.
    expect(operatorFactor("praha1", "public"), "naměřeno 0,99 na 3 bytech, bere se celé").toBe(0.99);
    expect(operatorFactor("praha2", "public"), "bez vlastního bytu: nedědí 0,99 z P1").toBe(0.95);
    expect(operatorFactor("praha3", "public"), "1,21 na 2 bytech (54 dní) -> váha 0,5 -> 1,155").toBe(1.155);
    expect(operatorFactor("praha5", "public"), "1,08 je POD výchozí, bere se celé i když snižuje").toBe(1.08);
    for (const loc of ["praha4", "praha6", "praha7", "praha8", "praha9"] as const)
      expect(operatorFactor(loc, "public"), `${loc} bez měření zůstává na výchozí`).toBe(1.1);
    // Praha 8 se NESRÁŽÍ za vysoký násobek: uvnitř okresu je Karlín.
    expect(OPERATOR_EVIDENCE.praha8, "Praha 8 nemá vlastní měření a nesmí ho dostat od oka").toBeUndefined();
    expect(publicFactorFrom(1.21, 0.5)).toBe(1.155);
    expect(publicFactorFrom(1.08, 1), "pod výchozí -> celé").toBe(1.08);
    expect(publicFactorFrom(1.21, 1), "plná váha -> celé naměřené").toBe(1.21);
    // Interní faktor je od 31. 8. 2026 TOTOŽNÝ s veřejným: rozdíl mezi režimy
    // je množství informací o konkrétním bytě, ne násobitel. Prohlídka odstraní
    // nejistotu o bytě, ale nezvětší vzorek, ze kterého je faktor okresu měřený.
    expect(operatorFactor("praha1", "internal")).toBe(0.99);
    expect(operatorFactor("praha5", "internal")).toBe(1.08);
    expect(operatorFactor("praha3", "internal")).toBe(1.155);

    // RevPAR × dny NENÍ tržba na inzerát: PriceLabs počítá RevPAR z dostupných
    // nocí, avg_revenue je za celý kalendářní měsíc. Rozklad 27 segmentů dal 0,92.
    expect(AVAILABILITY).toBe(0.92);

    for (const [loc, bands] of Object.entries(MARKET_STR))
      for (const [band, cell] of Object.entries(bands)) {
        const size = sizeOf(band);
        const m2 = band === "1BR" ? 35 : band === "2BR" ? 60 : 105;
        const r = ownerMonthly(loc, size, { m2 });
        if (!r.supported) throw new Error(`${loc} ${band} má data, ale model je nevrací`);
        expect(r.band).toBe(band);
        expect(r.adr).toBe(cell.adr);
        // rozpětí je vždy kladné a vršek nad spodkem
        expect(r.high).toBeGreaterThan(r.low);
        expect(r.mid).toBeGreaterThan(0);
        // horní hranice u pásma bez překlopení = tržní RevPAR × dny × dostupnost × faktor
        if (size === "1kk" || size === "4kk") {
          const k = operatorFactor(loc, "public");
          expect(r.antam.gross).toBe(Math.round(cell.revpar * 30.44 * 1.08 * AVAILABILITY * k));
        }
        expect(Math.round(r.market.occupancy * 100)).toBe(marketOccPct(loc as MeasuredLocation, band as "1BR" | "2BR" | "3BR"));
      }
  });

  /** Kalibrační portfolio: skutečné plochy (PortfolioSection) a skutečný výsledek
   *  majiteli z rekonciliace proti Hospitable za 8/2025 až 7/2026, u novějších
   *  bytů za jejich plné měsíce. Slouží ke kontrole, že veřejný model není
   *  systematicky nad realitou. NENÍ to pravidlo „každý byt musí web překonat“:
   *  veřejné číslo je mírně konzervativní výhled dopředu, ne minimum přes
   *  historii, a legitimní zvýšení modelu nemá padat kvůli jednomu slabšímu
   *  měsíci jednoho bytu. */
  const CALIBRATION: { name: string; loc: LocationKey; m2: number; size: SizeKey; actual: number }[] = [
    { name: "402", loc: "praha1", m2: 52, size: "2kk", actual: 59913 },
    { name: "405", loc: "praha1", m2: 52, size: "2kk", actual: 52553 },
    { name: "302", loc: "praha1", m2: 52, size: "2kk", actual: 52271 },
    { name: "Modern AC", loc: "praha3", m2: 55, size: "2kk", actual: 49200 },
    { name: "Garden APT", loc: "praha3", m2: 60, size: "2kk", actual: 45345 },
    { name: "Mozart", loc: "praha5", m2: 40, size: "2kk", actual: 30705 },
  ];

  /** HEURISTIC / regression guard. Meze 0,70 a 1,15 nejsou naměřené, jsou to
   *  smoke-test proti tomu, aby se model omylem rozbil (zlomený fallback,
   *  dvakrát aplikovaná korekce, prohozený faktor). Neříkají, že model je
   *  správný, ani že má být pod každým jednotlivým bytem. Skutečné modelové
   *  invarianty hlídá test rozhodovací cesty pod tímhle. */
  it("veřejný model je na kalibračním portfoliu jako celku konzervativní (smoke test)", () => {
    let est = 0, real = 0, worst = 0, worstName = "";
    for (const c of CALIBRATION) {
      const r = ownerMonthly(c.loc, c.size, { m2: c.m2 });
      if (!r.supported) throw new Error(`${c.name}: model nevrací číslo`);
      // Od 31. 8. 2026 je veřejné číslo VRŠEK rozpětí (headline = potenciál),
      // takže pojistka musí měřit vršek, ne střed. Jinak by hlídala číslo,
      // které se majiteli nikde neukazuje.
      est += r.high; real += c.actual;
      const over = r.high / c.actual;
      if (over > worst) { worst = over; worstName = c.name; }
    }
    // HEURISTIC: meze zvolené, ne změřené. Na celku pod realitou, ale ne
    // absurdně nízko: kdyby poměr spadl pod 0,70, je někde zlomený fallback.
    expect(est / real, "veřejný odhad nesmí být na celku nad realitou").toBeLessThanOrEqual(1);
    expect(est / real, "a nesmí spadnout do nesmyslu").toBeGreaterThan(0.7);
    // HEURISTIC: jednotlivý byt smí být nad odhadem i pod ním, hlídá se jen
    // hrubé přestřelení. Není to pravidlo „každý byt musí web překonat“.
    expect(worst, `nejvíc nadstřelený byt: ${worstName}`).toBeLessThanOrEqual(1.15);
  });

  it("INVARIANT: přepnutí na interní režim samo o sobě číslo nezvedne", () => {
    // Rozdíl mezi veřejným a interním NENÍ násobitel, ale množství informací.
    // Bez zaznamenaného pozorování musí interní sedět na veřejném do koruny.
    for (const loc of Object.keys(MARKET_STR) as MeasuredLocation[])
      for (const size of ["1kk", "2kk", "3kk", "4kk"] as const) {
        const m2 = typicalArea(loc, size);
        const pub = ownerMonthly(loc, size, { m2 });
        const int = ownerMonthly(loc, size, { m2, scope: "internal" });
        if (!pub.supported || !int.supported) throw new Error(`${loc} ${size}`);
        expect(int.low, `${loc} ${size}`).toBe(pub.low);
        expect(int.high, `${loc} ${size}`).toBe(pub.high);
        expect(int.trace.factor, `${loc} ${size}: faktor se scope neliší`).toBe(pub.trace.factor);
        expect(int.trace.config).toBe(null);
      }
    // Prohlídka nezvětší vzorek okresu, takže se faktor scope nemění.
    for (const loc of ["praha1", "praha2", "praha3", "praha5", "praha9"] as const)
      expect(operatorFactor(loc, "internal"), loc).toBe(operatorFactor(loc, "public"));
  });

  it("pozorovaná konfigurace hne číslem OBĚMA směry a jen interně", () => {
    const m2 = typicalArea("praha9", "3kk"); // w = 0,23: web tu hádá nejvíc
    const pub = ownerMonthly("praha9", "3kk", { m2 });
    const good = ownerMonthly("praha9", "3kk", { m2, scope: "internal",
      config: { band: "3BR", evidence: "dvě samostatné ložnice + obývák unese třetí spací pokoj" } });
    const poor = ownerMonthly("praha9", "3kk", { m2, scope: "internal",
      config: { band: "2BR", evidence: "průchozí pokoj, obývák bez místa na lůžko" } });
    if (!pub.supported || !good.supported || !poor.supported) throw new Error("praha9");
    expect(good.high, "doložená lepší konfigurace zvedne").toBeGreaterThan(pub.high);
    expect(poor.high, "doložená horší konfigurace SRAZÍ pod veřejný odhad").toBeLessThan(pub.high);
    // co číslo posunulo, musí být dohledatelné
    expect(good.trace.config?.band).toBe("3BR");
    expect(good.trace.config?.evidence).toContain("ložnice");
    expect(good.trace.w, "pozorování nahradí odhad z m², nemísí se").toBe(0);
    // veřejný režim konfiguraci ignoruje, nedá se tudy do webu propašovat
    const sneak = ownerMonthly("praha9", "3kk", { m2,
      config: { band: "3BR", evidence: "pokus obejít veřejný režim" } });
    if (!sneak.supported) throw new Error("praha9");
    expect(sneak.high).toBe(pub.high);
    expect(sneak.trace.config).toBe(null);
  });

  it("rozhodovací cesta u typických scénářů (pásmo, překlopení, čtvrť, faktor)", () => {
    const cases: { label: string; loc: LocationKey; size: SizeKey; m2: number; ctvrt?: string | null;
      base: string; next: string | null; w: number; usedCtvrt: string | null; factor: number; derived: boolean }[] = [
      { label: "P1 2+kk 52 m², Ostatní", loc: "praha1", size: "2kk", m2: 52, ctvrt: null,
        base: "1BR", next: "2BR", w: 0.8, usedCtvrt: null, factor: 0.99, derived: false },
      { label: "P1 2+kk 52 m², Staré Město", loc: "praha1", size: "2kk", m2: 52, ctvrt: "stare_mesto",
        base: "1BR", next: "2BR", w: 0.8, usedCtvrt: "stare_mesto", factor: 0.99, derived: false },
      { label: "P3 2+kk 55 m²", loc: "praha3", size: "2kk", m2: 55,
        base: "1BR", next: "2BR", w: 1, usedCtvrt: null, factor: 1.155, derived: false },
      { label: "P5 2+kk 40 m² (1BR produkt)", loc: "praha5", size: "2kk", m2: 40,
        base: "1BR", next: "2BR", w: 0, usedCtvrt: null, factor: 1.08, derived: false },
      { label: "P9 4+kk 105 m² (3BR dopočítané z 1BR)", loc: "praha9", size: "4kk", m2: 105,
        base: "3BR", next: null, w: 0, usedCtvrt: null, factor: 1.1, derived: true },
    ];
    for (const c of cases) {
      const r = ownerMonthly(c.loc, c.size, { m2: c.m2, ctvrt: c.ctvrt });
      if (!r.supported) throw new Error(`${c.label}: model nevrací číslo`);
      expect(r.trace.base, c.label).toBe(c.base);
      expect(r.trace.next, c.label).toBe(c.next);
      expect(r.trace.w, c.label).toBeCloseTo(c.w, 3);
      expect(r.trace.ctvrt, c.label).toBe(c.usedCtvrt);
      expect(r.trace.factor, c.label).toBe(c.factor);
      expect(r.derived, c.label).toBe(c.derived);
      expect(r.high, c.label).toBeGreaterThan(r.low);
    }
    // Čtvrť musí číslo posunout, jinak se vrstva někde ztrácí.
    const okres = ownerMonthly("praha1", "2kk", { m2: 52, ctvrt: null });
    const ctvrt = ownerMonthly("praha1", "2kk", { m2: 52, ctvrt: "stare_mesto" });
    expect(ctvrt.supported && okres.supported && ctvrt.mid).toBeGreaterThan(okres.supported ? okres.mid : 0);
    // Čtvrť patřící pod jiný okres se ignoruje, nikdy se neopíše cizí číslo.
    const cizi = ownerMonthly("praha3", "2kk", { m2: 52, ctvrt: "stare_mesto" });
    expect(cizi.supported && cizi.trace.ctvrt).toBe(null);
    // Korekce dostupnosti se aplikuje právě jednou: hrubé tržby u pásma bez
    // překlopení sedí přesně na RevPAR × dny × 0,92 × faktor.
    const p1 = ownerMonthly("praha1", "1kk", { m2: 35 });
    expect(p1.supported && p1.antam.gross).toBe(
      Math.round(MARKET_STR.praha1["1BR"]!.revpar * 30.44 * 1.08 * AVAILABILITY * operatorFactor("praha1", "public")),
    );
    // Staré Město mísí, nepřepisuje: leží mezi okresem a vlastními daty čtvrti.
    const smAdr = MARKET_CTVRT.stare_mesto.bands["2BR"]!.adr;
    expect(ctvrt.supported && ctvrt.adr).toBeGreaterThan(okres.supported ? okres.adr : 0);
    expect(ctvrt.supported && ctvrt.adr).toBeLessThanOrEqual(smAdr);
  });

  it("čtvrťová vrstva nájmu: bez čtvrti nula, cizí čtvrť se ignoruje, sdílená má vlastní hodnotu", () => {
    // Okresní křivka se NEPŘEFITOVALA: tohle je jen reziduum čtvrti proti ní.
    // Bez vybrané čtvrti se proto nesmí hnout ani koruna.
    for (const loc of Object.keys(RENT_INTERCEPT) as LocationKey[])
      for (const size of ["1kk", "2kk", "3kk", "4kk"] as const)
        for (const m2 of [30, 55, 80, 120]) {
          expect(rentFor(loc, size, m2, "mix", null), `${loc} ${m2}`).toBe(rentFor(loc, size, m2));
          expect(rentFor(loc, size, m2, "mix", undefined), `${loc} ${m2}`).toBe(rentFor(loc, size, m2));
        }
    expect(ctvrtRentFactor("praha1", null)).toBe(1);
    expect(ctvrtRentFactor("praha8", "neznama_ctvrt")).toBe(1);
    // cizí čtvrť pod jiným okresem se ignoruje, stejně jako na STR straně
    expect(ctvrtRentFactor("praha1", "karlin"), "Karlín nepatří pod Prahu 1").toBe(1);
    expect(rentFor("praha1", "2kk", 52, "mix", "karlin")).toBe(rentFor("praha1", "2kk", 52));
    // Karlín je důvod, proč vrstva vznikla: bez ní by se jeho násobek nafoukl
    expect(ctvrtRentFactor("praha8", "karlin")).toBeGreaterThan(1.1);
    expect(rentFor("praha8", "2kk", 53, "mix", "karlin")).toBeGreaterThan(rentFor("praha8", "2kk", 53));
    // sdílená čtvrť má PRO KAŽDÝ OKRES vlastní hodnotu
    expect(ctvrtRentFactor("praha2", "vinohrady")).not.toBe(ctvrtRentFactor("praha3", "vinohrady"));
    expect(ctvrtRentFactor("praha8", "liben")).not.toBe(ctvrtRentFactor("praha9", "liben"));
    // Staré Město má n=11, tedy pod prahem: dnes nemění nic
    expect(ctvrtRentFactor("praha1", "stare_mesto"), "n=11 je pod prahem shrinkage").toBe(1);
    // HEURISTIC: uložené hodnoty jsou UŽ po shrinkage, takže žádná není extrémní
    for (const g of GEO) {
      if ("effect" in g.ltr) {
        expect(Math.abs(g.ltr.effect), g.id).toBeLessThan(0.2);
        expect(g.ltr.n, `${g.id} pod prahem se sem nedostane`).toBeGreaterThanOrEqual(12);
      } else {
        expect(g.ltr.reason.length, `${g.id}: fallback musí mít důvod`).toBeGreaterThan(5);
      }
    }
    // REGISTR: dvě identity a jejich pravidla
    expect(new Set(GEO.map((g) => g.id)).size, "id kontextu je unikátní").toBe(GEO.length);
    for (const g of GEO) {
      expect(g.id, `${g.id} má tvar okres/geometrie`).toBe(`${g.district}/${g.sourceGeometry}`);
      expect(g.sourceGeometry, "slug bez diakritiky a mezer").toMatch(/^[a-z0-9_]+$/);
    }
    // sdílená geometrie: JEDEN polygon, víc kontextů, různé LTR hodnoty
    const shared = ["vinohrady", "nove_mesto", "liben"];
    for (const geom of shared) {
      const ctxs = GEO.filter((g) => g.sourceGeometry === geom);
      expect(ctxs.length, `${geom} má být sdílená`).toBeGreaterThan(1);
      const effects = ctxs.map((g) => ("effect" in g.ltr ? g.ltr.effect : null));
      expect(new Set(effects).size, `${geom}: kontexty mají mít vlastní hodnoty`).toBe(ctxs.length);
    }
    // JOIN: každá STR čtvrť musí mít pro KAŽDÝ svůj rodičovský okres kontext
    // v registru. Tím je tiché rozpojení STR/LTR nemožné.
    for (const [geom, c] of Object.entries(MARKET_CTVRT))
      for (const parent of c.parents)
        expect(geoContext(parent, geom), `${parent}/${geom}: STR čtvrť bez kontextu v registru`).toBeTruthy();
    expect(geoContext("praha1", "karlin"), "cizí kombinace neexistuje").toBeUndefined();
    // kalkulačka i graf posílají do nájmu TÉŽ čtvrť jako do STR
    expect(readFileSync("src/components/CalculatorSection.tsx", "utf8")).toContain('rentFor(location as LocationKey, size, m2, "mix", ctvrt)');
    expect(readFileSync("src/lib/horizon.ts", "utf8")).toContain('rentFor(location as LocationKey, size, m2, "mix", ctvrt)');
    // a použitý faktor je vidět ve výstupu, ne jen schovaný v čísle
    for (const [loc, ct, exp1] of [["praha8", "karlin", true], ["praha1", "stare_mesto", false]] as const) {
      const d = fiveYear(loc, "2kk", 53, ct);
      expect(d && (d.rentCtvrtFactor > 1) === exp1, `${loc}/${ct}`).toBe(true);
    }
  });

  it("nájemní benchmark je JEDEN na celé stránce a růst cen se nehádá", () => {
    // Do 31. 8. 2026 kalkulačka ukazovala nájem "mix" a graf tiše měřil proti
    // "furnished" (+11,4 %), takže stránka uváděla pro tentýž byt dva nájmy.
    expect(FURN_RENT.mix, "mix = fit celého vzorku, běžný pražský inzerát").toBe(1);
    const hzSrc = readFileSync("src/lib/horizon.ts", "utf8");
    expect(hzSrc, "graf musí brát týž nájem jako kalkulačka").toContain('rentFor(location as LocationKey, size, m2, "mix", ctvrt)');
    expect(hzSrc, "furnished se do výpočtu grafu nesmí vrátit").not.toMatch(/rentFor\([^)]*"furnished"/);
    for (const loc of ["praha1", "praha4", "praha9"] as const)
      for (const size of ["2kk", "3kk"] as const) {
        const m2 = typicalArea(loc, size);
        const d = fiveYear(loc, size, m2);
        if (!d) throw new Error(`${loc} ${size}`);
        expect(d.rent, `${loc} ${size}: graf i kalkulačka jeden nájem`).toBe(rentFor(loc, size, m2));
      }
    // Žádná makro předpověď: dnešní podmínky drží po celých pět let, a web to říká.
    expect(RENT_GROWTH, "nehádáme růst nájmů").toBe(0);
    expect(STR_GROWTH, "ani růst krátkodobého pronájmu").toBe(0);
    for (const d of [cs, vi]) {
      expect(strip(d.hz_growth), "text nesmí slibovat 5 % proti 3 %").not.toMatch(/5\s*%|3\s*%/);
      expect(strip(d.hz_growth)).toMatch(/neodhadujeme|không đoán/i);
      expect(strip(d.hz_stat_gap), "pětiletka je po nákladech, ať je to vidět").toMatch(/po nákladech|đã trừ chi phí/i);
    }
  });

  it("pětiletý graf počítá ze stejného čísla jako kalkulačka, obě křivky", () => {
    for (const loc of ["praha1", "praha3", "praha5"] as const)
      for (const size of ["2kk", "3kk"] as const) {
        const r = ownerMonthly(loc, size);
        const d = fiveYear(loc, size);
        if (!r.supported || !d) throw new Error(`${loc} ${size}`);
        // 2. rok (po rozjezdu): měsíční přírůstek = net − energie − obnova
        // Veřejně jede graf na TOMTÉŽ základu jako headline kalkulačky (vršek).
        expect(d.basis).toBe("potential");
        // Bez růstového násobku (31. 8. 2026: RENT_GROWTH i STR_GROWTH = 0):
        // měsíční přírůstek je prostě čistý příjem minus energie a obnova.
        expect(d.str[24] - d.str[23]).toBeCloseTo(r.high - d.energy - d.renew, 5);
        expect(d.strMarket[24] - d.strMarket[23]).toBeCloseTo(r.low - d.energy - d.renew, 5);
        expect(d.strHigh[24] - d.strHigh[23]).toBeCloseTo(r.high - d.energy - d.renew, 5);
        expect(d.netMarket).toBe(r.market.net);
        // JEDEN nájemní benchmark: graf i kalkulačka berou "mix" (31. 8. 2026).
        expect(d.rent).toBe(rentFor(loc, size, typicalArea(loc, size)));
        expect(d.lt[12] - d.lt[11]).toBeCloseTo(d.rent, 5);
      }
    for (const loc of ["praha1", "praha4"] as const) {
      const d = fiveYear(loc, "2kk");
      if (!d) throw new Error(loc);
      expect(d.setup).toBe(LAUNCH_FEE);
      expect(d.rent).toBe(rentFor(loc, "2kk", typicalArea(loc, "2kk")));
    }
    // teaser se ukazuje jen pro kladný pětiletý rozdíl
    const calcSrc = readFileSync("src/components/CalculatorSection.tsx", "utf8");
    // Pětiletý teaser je z karty výsledku PRYČ (31. 8. 2026): roční rozdíl je
    // hrubý rozdíl měsíčních příjmů, pětiletka je po energiích, obnově, uvedení
    // do provozu a rozjezdu. Vedle sebe se to čte jako chyba.
    expect(calcSrc, "pětiletý teaser se nesmí vrátit do karty").not.toContain("calc_teaser_1");
    expect(calcSrc, "kalkulačka už pětiletku nepočítá").not.toContain("fiveYear");
    const hz = readFileSync("src/components/HorizonSection.tsx", "utf8");
    expect(hz).toContain("d.strMarket");
    expect(hz).toContain("d.strHigh");
    expect(hz).toContain("fiveYear(location, size, m2, ctvrt)");
    // Jedna definice „scénáře s Antam" na celé stránce: měsíční headline i
    // pětiletý teaser musí stát na stejném základu. Dřív byl headline střed
    // a teaser taky střed; od 31. 8. 2026 je headline vršek, tak i graf.
    for (const loc of ["praha1", "praha3", "praha5"] as const)
      for (const size of ["1kk", "2kk", "3kk", "4kk"] as const) {
        const r = ownerMonthly(loc, size);
        const pub = fiveYear(loc, size);
        const internal = fiveYear(loc, size, undefined, null, "mid");
        if (!r.supported || !pub || !internal) throw new Error(`${loc} ${size}`);
        expect(pub.net, `${loc} ${size}: graf jede na headline čísle`).toBe(r.high);
        expect(internal.net, `${loc} ${size}: interní základ zůstává střed`).toBe(r.mid);
        expect(internal.basis).toBe("mid");
        // pásmo se tím nemění, nejistota zůstává vidět
        expect(pub.netMarket).toBe(r.market.net);
        expect(pub.netHigh).toBe(r.antam.net);
      }
    // Popisek hlavní křivky nesmí říkat „střed", když kreslí potenciál.
    for (const d of [cs, vi]) {
      expect(strip(d.hz_legend_str), "legenda grafu tvrdí střed").not.toMatch(/střed|mức giữa/i);
      expect(strip(d.hz_legend_str)).toMatch(/potenciál|tiềm năng/i);
    }
    // graf počítá jen plně vybavený byt: bez přepínače vybavení, start = uvedení do provozu
    expect(hz).not.toContain("setFurn");
    expect(strip(cs.hz_furnish_note)).toContain("25 000");
    expect(strip(vi.hz_furnish_note)).toContain("25 000");
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
    // 2C: g_pair2_text (box krytí škod v garanci) se z hlavní hierarchie
    // odstranil; strop teď nese ceník a FAQ. Fakt se hlídá dál, jen jinde.
    for (const key of ["faq11_a", "pr7_note"] as const) {
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
    // QA-03: rozlišení zůstává, jen se neopírá o roční strop, který VOP nemají.
    // Hranicí mezi "řešíme hned" a "až po vašem souhlasu" je 5 000 Kč na případ.
    expect(strip(cs.faq11_a)).toMatch(/[Oo]potřebení/);
    expect(strip(cs.faq11_a)).toMatch(/5 000 Kč za případ/);
    expect(strip(cs.faq11_a)).toMatch(/po vašem souhlasu/);
    expect(strip(vi.faq11_a)).toMatch(/5 000 Kč/);
    expect(strip(vi.faq11_a)).toMatch(/hư hỏng|bảo trì|sửa chữa/);
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
    // 2C: karty násobek nájmu už neukazují (dělá to kalkulačka, osobně),
    // takže se PortfolioSection na ratioFor neptá. Matematika se hlídá dál
    // přes MCP a přes přímé volání níž.
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
    // graf Za 5 let počítá zařízený byt (jediný scénář od 30. 8. 2026)
    const hz = readFileSync("src/lib/horizon.ts", "utf8");
    // Graf bere TÝŽ nájem jako kalkulačka ("mix"), viz test o jednom benchmarku.
    expect(hz).toContain('size, m2, "mix"');
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
