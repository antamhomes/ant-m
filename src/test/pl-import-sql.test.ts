import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";

/**
 * Regrese z 2. 9. 2026: závěrečný `pull_state = 'complete'` neměl filtr na
 * pásmo, takže by u téže geografie a okna přepnul na complete i starý
 * souhrnný řádek pásma `all`, který v artefaktu vůbec není.
 */
const sql = execFileSync("node", [
  "scripts/pl-import.mjs",
  "--artifact", "data/pricelabs-2026-09/nove_mesto.json",
  "--geo", "praha1_nove_mesto", "--level", "ctvrt",
  "--source-geometry", "nove_mesto", "--slug", "nove_mesto",
  "--bands", "1BR,2BR,3BR",
  "--approved-geometry", "New Town official boundary (openstreetmap)",
  "--ltr-context", "praha1/nove_mesto",
  "--emit-sql",
], { encoding: "utf8" });

describe("pl-import.mjs emitovane SQL", () => {
  const complete = sql.split("\n").findIndex((l) => l.includes("set pull_state = 'complete'"));

  it("prepina complete jen u pasem z artefaktu", () => {
    expect(complete).toBeGreaterThan(-1);
    const stmt = sql.split("\n").slice(complete, complete + 3).join(" ");
    expect(stmt).toContain("band in ('1BR', '2BR', '3BR')");
  });

  it("nikdy nezasahne pasmo all", () => {
    const stmt = sql.split("\n").slice(complete, complete + 3).join(" ");
    expect(stmt).not.toMatch(/band\s+in\s+\([^)]*'all'/);
    // a bez filtru na pasmo by prikaz nesmel existovat vubec
    expect(stmt).toMatch(/and band in \(/);
  });

  it("nic nemaze ani neruší", () => {
    expect(sql).not.toMatch(/\b(delete from|drop |truncate )/i);
  });
});
