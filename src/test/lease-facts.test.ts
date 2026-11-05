/**
 * FAKTA NOVÉ NABÍDKY (5. 11. 2026): nájem na 3 roky ve výši splátky.
 * Čísla žijí v lib/lease.ts; kopie (lz_*), MCP a meta je jen opisují.
 * Když test spadne, mění se VŠECHNA místa naráz, ne test.
 */
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import translations, { t } from "@/i18n/translations";
import {
  annuity, quoteLease, czk, LTV, TERM_YEARS, LEASE_MONTHS, RATE_DEFAULT, RENT_DAYS_BEFORE,
  DEFAULT_EXIT_DAYS, REGULATION_NOTICE_MONTHS, LEASE_COVER_RATIO,
} from "@/lib/lease";
import { HERO_EXAMPLE } from "@/components/lease/LeaseHero";
import { META } from "@/lib/seoMeta";

const cs = translations.cs as Record<string, string>;
const strip = (s: string) => s.replace(/ /g, " ");
const lz = Object.entries(cs).filter(([k]) => k.startsWith("lz_") || k.startsWith("nav_"));
const src = (p: string) => readFileSync(p, "utf8");

describe("nájem na 3 roky: parametry", () => {
  it("standardní hypotéka 70 % na 30 let, 36 měsíců, nájem 5 dní před splátkou", () => {
    expect(LTV).toBe(0.7);
    expect(TERM_YEARS).toBe(30);
    expect(LEASE_MONTHS).toBe(36);
    expect(RENT_DAYS_BEFORE).toBe(5);
    expect(DEFAULT_EXIT_DAYS).toBe(30);
    expect(REGULATION_NOTICE_MONTHS).toBe(2);
    expect(LEASE_COVER_RATIO).toBe(0.6);
  });

  it("anuita sedí na ruční výpočet a příklad v hero je z téže funkce", () => {
    // 6 580 000 Kč, 5,1 % (ČBA Hypomonitor 9/2026), 360 splátek
    expect(RATE_DEFAULT).toBe(0.051);
    expect(Math.round(annuity(6_580_000, 0.051, 30))).toBe(35726);
    expect(Math.round(annuity(6_580_000, 0.0491, 30))).toBe(34962);
    const q = quoteLease(HERO_EXAMPLE.price, HERO_EXAMPLE.loc, HERO_EXAMPLE.size, { ctvrt: HERO_EXAMPLE.ctvrt });
    expect(q.own).toBe(2_820_000);
    expect(q.loan).toBe(6_580_000);
    expect(q.payment).toBe(35726);
    expect(q.covered, "příklad v hero musí být byt, který pokryjeme celý").toBe("full");
    expect(q.rent).toBe(q.payment);
    expect(q.shortfall).toBe(0);
  });

  it("strop nájmu jde z trhu (interní faktor), ne z našich výsledků, a drží se 60 % čistého výnosu", () => {
    const q = quoteLease(9_400_000, "praha1", "2kk", { ctvrt: "nove_mesto" });
    expect(q.noi).not.toBeNull();
    expect(q.cap).toBe(Math.round((q.noi! * LEASE_COVER_RATIO) / 100) * 100);
    // drahý byt ve slabší čtvrti = částečné krytí, ne tiché „ano"
    const p = quoteLease(14_000_000, "praha7", "2kk", { ctvrt: "holesovice" });
    expect(p.covered).toBe("partial");
    expect(p.rent).toBe(p.cap);
    expect(p.shortfall).toBe(p.payment - (p.cap ?? 0));
    // bez lokality nic neslibujeme
    expect(quoteLease(9_000_000, null, "2kk").covered).toBe("review");
  });

  it("formát částky: pevné mezery, bez desetin", () => {
    expect(czk(34962)).toBe("34 962 Kč");
    expect(czk(9_400_000)).toBe("9 400 000 Kč");
  });
});

describe("nájem na 3 roky: kopie", () => {
  it("klíčová čísla jsou v textu stejná jako v modelu", () => {
    const all = lz.map(([, v]) => strip(v)).join("\n");
    expect(all).toMatch(/70 %/);
    expect(all).toMatch(/30 let/);
    expect(all).toMatch(/36 měsíců/);
    expect(all).toMatch(/5 dní před/);
    expect(all).toMatch(/30 dn[íů]/);
    expect(all).toMatch(/dvouměsíční/);
    expect(all).toMatch(/\+ 20 %/);
    expect(all).toMatch(/kupujete vy/);
    expect(all).not.toMatch(/100 000 Kč na pokoj/);
    expect(all).toMatch(/v hotovosti/);
    expect(all).toMatch(/kratší splatnost doplácíte vy/);
    expect(all).toMatch(/24 hodin/);
    expect(strip(cs.lz_hero_line)).toBe("Provoz děláme sami. Bez nájemníka, bez správce, bez vaší práce.");
    expect(strip(cs.lz_sheet_sign)).toBe("Antam Homes s.r.o.");
  });

  it("bankovní register: žádné pomlčky, žádná správa za 20 %, žádné Airbnb v hero a nabídce", () => {
    for (const [k, v] of lz) {
      expect(v, `${k} má pomlčku`).not.toContain("—");
      expect(v, `${k} mluví o správě za procenta`).not.toMatch(/20 % \+ DPH|24,2 %|odměn/);
    }
    for (const k of ["lz_hero_title", "lz_hero_desc", "lz_offer_1", "lz_offer_2", "lz_offer_3", "lz_offer_4", "lz_offer_5", "lz_offer_6", "lz_offer_7", "lz_problem_1", "lz_problem_2", "lz_problem_3"])
      expect(cs[k], `${k} nemá říkat Airbnb`).not.toMatch(/Airbnb|Booking/);
    // kde se to říká: jednou, v Z čeho platíme
    expect(strip(cs.lz_why_p)).toMatch(/krátkodobě/);
  });

  it("t() drží typografii i bez vietnamštiny: jednopísmenné předložky se lepí, vi slovník neexistuje", () => {
    expect(t("cs", "lz_hero_desc")).toContain("i když");
    expect((translations as unknown as Record<string, unknown>).vi).toBeUndefined();
    expect(t("vi", "lz_hero_title")).toBe(t("cs", "lz_hero_title"));
  });
});

describe("nájem na 3 roky: jedna pravda napříč webem, MCP a meta", () => {
  it("MCP get_services popisuje tutéž nabídku a nemluví o správě za 20 %", () => {
    const s = src("src/lib/mcp/tools/get-services.ts");
    expect(s).toContain("36 měsíců");
    expect(s).toContain("5 dní před splátkou");
    expect(s).toContain("pořizovací ceny plus 20 %");
    expect(s).toContain("270 000 Kč");
    expect(s).not.toMatch(/managementCommissionRate|garance minimálního výnosu|DAMAGE_COVER/);
    expect(s).toContain('from "../../lease"');
  });

  it("MCP quote_lease počítá stejnou funkcí jako web", () => {
    const s = src("src/lib/mcp/tools/quote-lease.ts");
    expect(s).toContain("quoteLease(");
    expect(s).not.toMatch(/annuity\(|0\.7 \*|\* 0\.7/);
    expect(src("src/lib/mcp/index.ts")).toContain("quoteLeaseTool");
  });

  it("kalkulačka a hero sdílejí nabídkový list a lib/lease; stará kalkulačka výnosu na homepage není", () => {
    const calc = src("src/components/lease/LeaseCalc.tsx");
    expect(calc).toContain("quoteLease(");
    expect(calc).toContain("<TermSheet");
    expect(src("src/components/lease/LeaseHero.tsx")).toContain("<TermSheet");
    expect(src("src/pages/Index.tsx")).not.toContain("CalculatorSection");
  });

  it("meta, title a sitemap mluví o nájmu, ne o správě; vietnamská verze je pryč", () => {
    expect(META.home.cs.title).toMatch(/hypotéky investorům/);
    expect(META.home.cs.desc).toMatch(/3 roky/);
    const html = src("index.html");
    expect(html).toContain(META.home.cs.title);
    expect(html).not.toMatch(/hreflang="vi"|og:locale:alternate|\/vn"/);
    const sitemap = src("public/sitemap.xml");
    expect(sitemap).not.toContain("/vn");
    expect(sitemap).not.toContain("/sprava");
    expect(src("vite.config.ts")).not.toContain('"dist/vn/index.html"');
  });

  it("wordmark je Antam; právní název zůstává v patičce", () => {
    expect(src("src/components/Wordmark.tsx")).toMatch(/>\s*Antam\s*<\/span>/);
    expect(strip(cs.footer_legal)).toContain("IČO 21904022");
  });
});
