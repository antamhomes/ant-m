import { describe, it, expect } from "vitest";
import { localCell, ctvrtiOf, MARKET_STR, type MeasuredLocation, type Band } from "../lib/yield";
import { population } from "./population";

/**
 * INVARIANT MONOTONIE PODLE VELIKOSTI (schváleno 2. 9. 2026).
 *
 * Pro tutéž lokalitu/čtvrť × dispozici × sezónu × verzi modelu nesmí větší
 * podporovaný kbelík (s → m → l) dát NIŽŠÍ absolutní potenciál STR než ten
 * o stupeň menší. Smí být stejný, smí být vyšší. Nižší ne.
 *
 * Platí to pro low, mid, high a pro hrubé tržby obou variant. NEPLATÍ to
 * pro násobek proti nájmu ani pro roční výhodu — ty klesat smí, protože
 * nájem s plochou roste rychleji než STR (1+kk a 4+kk jsou u STR záměrně
 * ploché, viz docs/calculator-model.md). Tady se hlídá jen to, že Antam
 * majiteli nikdy neřekne „větší byt vydělá míň".
 *
 * PROČ TEST, A NE RUNTIME CLAMP. Invariant dnes platí z konstrukce: gross
 * je lineární v překlopení w a w s plochou neklesá, takže stačí, aby
 * nextCell.revpar >= baseCell.revpar. To ale nic nevynucuje — příští pull
 * s podivným tenkým 3BR by to tiše porušil. Runtime clamp
 * (gNext = max(gNext, gBase)) by porušení schoval, jenže by schoval
 * i SKUTEČNĚ naměřený pokles, a měřená data jsou autorita. Proto test:
 * spadne, člověk se podívá, a buď je to chyba dat, nebo se výjimka
 * výslovně zapíše níž i s důkazem.
 *
 * ŽÁDNÉ heuristiky kapacity, žádné prémie, žádná změna kbelíků — jen
 * ověření, že model dělá to, co dnes tvrdí.
 */

/**
 * Výjimky: naměřený pokles, který se PŘIZNÁVÁ. Klíč je `${loc}/${ctvrt}
 * ${base}->${next}`, evidence musí říct, odkud pokles pochází (artefakt,
 * pásmo, období). Seznam ZAČÍNÁ PRÁZDNÝ a plnit se smí jen s přímým
 * tržním důkazem pro tentýž komerční segment — ne z nájmu, ne z m²,
 * ne z rozpadu, ne z odhadu.
 */
const MEASURED_EXCEPTIONS: { key: string; evidence: string }[] = [];
const isExcepted = (key: string) => MEASURED_EXCEPTIONS.some((e) => e.key === key);

const FIELDS = ["low", "mid", "high", "grossMarket", "grossAntam"] as const;
const ORDER = ["s", "m", "l", "xl"];

describe("monotonie podle velikosti: větší kbelík nikdy nevydělá míň", () => {
  it("s <= m <= l na low / mid / high / grossMarket / grossAntam v celé veřejné množině", () => {
    const rows = population().filter((r) => r.supported && !r.oversized);
    // seskupit podle (lokalita|čtvrť|dispozice|sezóna), uvnitř seřadit podle kbelíku
    const groups = new Map<string, any[]>();
    for (const r of rows) {
      const [loc, ct, size, bucket, season] = r.id.split("|");
      const k = `${loc}|${ct}|${size}|${season}`;
      (groups.get(k) ?? groups.set(k, []).get(k)!).push({ ...r, bucket });
    }
    let sequences = 0, transitions = 0;
    const violations: string[] = [];
    for (const [k, seq] of groups) {
      seq.sort((a, b) => ORDER.indexOf(a.bucket) - ORDER.indexOf(b.bucket));
      if (seq.length < 2) continue;
      sequences++;
      for (let i = 1; i < seq.length; i++) {
        transitions++;
        for (const f of FIELDS) {
          if (seq[i][f] < seq[i - 1][f])
            violations.push(`${k} ${f}: ${seq[i - 1].bucket}=${seq[i - 1][f]} -> ${seq[i].bucket}=${seq[i][f]}`);
        }
      }
    }
    // Rozumná velikost množiny — kdyby enumerace tiše zdegenerovala (viz
    // překlep presetM2 z 2. 9. 2026), tohle to prozradí dřív než prázdný
    // seznam porušení.
    expect(sequences, "počet sekvencí s>=2 kbelíky").toBeGreaterThanOrEqual(250);
    expect(transitions, "počet přechodů s->m, m->l").toBeGreaterThanOrEqual(500);
    expect(violations, "větší kbelík dal NIŽŠÍ absolutní STR výstup:\n  " + violations.join("\n  ")).toEqual([]);
  });

  it("strukturální podmínka: nextCell.revpar >= baseCell.revpar v každém dosažitelném kontextu", () => {
    const PAIRS: [Band, Band][] = [["1BR", "2BR"], ["2BR", "3BR"]];
    const problems: string[] = [];
    let checked = 0;
    for (const loc of Object.keys(MARKET_STR) as MeasuredLocation[]) {
      const contexts: (string | null)[] = [null, ...ctvrtiOf(loc).map((c) => c.id)];
      for (const ct of contexts) for (const [base, next] of PAIRS) {
        const A = localCell(loc, base, ct), B = localCell(loc, next, ct);
        if (!A || !B) continue;
        checked++;
        const key = `${loc}/${ct ?? "-"} ${base}->${next}`;
        if (B.revpar < A.revpar && !isExcepted(key))
          problems.push(`${key}: ${A.revpar.toFixed(1)} -> ${B.revpar.toFixed(1)}${B.derived ? " (next derived)" : ""}`);
      }
    }
    expect(checked, "dosažitelných dvojic pásem").toBeGreaterThanOrEqual(20);
    expect(problems, "vyšší pásmo má NIŽŠÍ RevPAR než nižší — bez zapsané výjimky:\n  " + problems.join("\n  ")).toEqual([]);
  });

  it("výjimky, pokud nějaké jsou, mají klíč i důkaz", () => {
    for (const e of MEASURED_EXCEPTIONS) {
      expect(e.key, "výjimka bez klíče").toMatch(/^praha\d+\/[a-z_-]+ [123]BR->[123]BR$/);
      expect(e.evidence.length, `výjimka ${e.key} bez důkazu`).toBeGreaterThan(20);
    }
  });
});
