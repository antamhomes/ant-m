import {
  ROOMS, ENERGY, ownerMonthly, rentFor, typicalArea, ctvrtRentFactor,
  LAUNCH_FEE, RENEW_PER_ROOM_YEAR,
  YEAR_ONE_RAMP, RENT_GROWTH, STR_GROWTH,
  type LocationKey, type SizeKey,
} from "@/lib/yield";
import type { CalcLoc } from "@/contexts/CalcContext";

export const HORIZON_MONTHS = 60;

/**
 * Pětiletý průběh: STEJNÝ stav a STEJNÉ funkce jako měsíční odhad v kalkulačce
 * (ownerMonthly na výnos, rentFor na nájem). Od měsíčního čísla se odečítají
 * energie a obnova vybavení; obojí graf vypisuje, aby bylo vidět, proč se
 * pětileté číslo liší od měsíčního. Vrací null pro lokality bez dat.
 * Křivka `str` = hlavní scénář podle parametru `basis`; veřejně je to vršek
 * rozpětí, tedy STEJNÝ základ jako headline kalkulačky, aby stránka neměla
 * dvě různé definice „scénáře s Antam". `strMarket` a `strHigh` = spodek
 * (průměr trhu) a vršek téhož rozpětí; všechny z téhož ownerMonthly, stejné
 * energie, obnova i start. Graf kreslí pás, nejistota zůstává vidět.
 *
 * Rozhodnutí 30. 8. 2026: graf počítá JEN plně vybavený byt (připravený pro
 * hosty). Start = uvedení do provozu 25 000 Kč; dovybavení se řeší v propočtu
 * a v ceníku, přepínač vybavení z grafu zmizel. Nájem pro srovnání je od
 * 31. 8. 2026 TÝŽ jako v kalkulačce (mix), viz poznámka u rentFor níž.
 */
/**
 * Který scénář je v grafu ta HLAVNÍ křivka.
 *  "potential" = vršek rozpětí, tedy TOTÉŽ číslo, které je v headline kalkulačky
 *                jako „Potenciál příjmu s Antam Homes" (rozhodnutí 31. 8. 2026).
 *  "mid"       = střed rozpětí; zůstává pro interní propočty, aby si mohly
 *                sáhnout na konzervativnější variantu.
 * Základ je VÝSLOVNÝ parametr, ne tiché přepsání mid: web i interní podklad
 * musí být schopné říct, které číslo zrovna kreslí. Pásmo (strMarket–strHigh)
 * se nemění, nejistota je pořád vidět.
 */
export type HorizonBasis = "potential" | "mid";

export const fiveYear = (
  location: CalcLoc, size: SizeKey, m2Input?: number, ctvrt?: string | null,
  basis: HorizonBasis = "potential",
) => {
  if (location === "jinde") return null;
  const m2 = m2Input ?? typicalArea(location, size);
  const year = ownerMonthly(location, size, { m2, ctvrt });
  if (!year.supported) return null;
  const net = basis === "potential" ? year.high : year.mid;
  const netMarket = year.low;
  const netHigh = year.high;
  const energy = ENERGY[size];
  const renew = (RENEW_PER_ROOM_YEAR * ROOMS[size]) / 12;
  const y1 = net * YEAR_ONE_RAMP - energy - renew;
  const y2 = net - energy - renew;
  const m1 = netMarket * YEAR_ONE_RAMP - energy - renew;
  const m2y = netMarket - energy - renew;
  const h1 = netHigh * YEAR_ONE_RAMP - energy - renew;
  const h2 = netHigh - energy - renew;
  // JEDEN nájemní benchmark na celé stránce. Do 31. 8. 2026 tu bylo "furnished"
  // (×1,114), zatímco kalkulačka ukazuje "mix" — stránka tedy pro tentýž byt
  // uváděla dva různé nájmy a graf tiše měřil proti o 11 % vyššímu. "mix" je
  // fit celého vzorku Sreality (zařízené i nezařízené), tedy to, co majitel
  // reálně dostane, když byt pronajme běžně. To je ta správná alternativa:
  // porovnávají se dvě strategie využití bytu, ne dva stejně provozované produkty.
  const rent = rentFor(location as LocationKey, size, m2, "mix", ctvrt);
  const setup = LAUNCH_FEE;
  const lt = [0], str = [-setup], strMarket = [-setup], strHigh = [-setup];
  for (let i = 1; i <= HORIZON_MONTHS; i++) {
    const yr = Math.floor((i - 1) / 12);
    lt.push(lt[i - 1] + rent * (1 + RENT_GROWTH) ** yr);
    str.push(str[i - 1] + (i <= 12 ? y1 : y2 * (1 + STR_GROWTH) ** yr));
    strMarket.push(strMarket[i - 1] + (i <= 12 ? m1 : m2y * (1 + STR_GROWTH) ** yr));
    strHigh.push(strHigh[i - 1] + (i <= 12 ? h1 : h2 * (1 + STR_GROWTH) ** yr));
  }
  let payback: number | null = null, cross: number | null = null;
  for (let i = 1; i <= HORIZON_MONTHS; i++) {
    if (payback === null && str[i] >= 0) payback = i;
    if (cross === null && str[i] >= lt[i]) cross = i;
  }
  return { lt, str, strMarket, strHigh, rent, rentCtvrtFactor: ctvrtRentFactor(location, ctvrt), m2, y2, net, netMarket, netHigh, basis, guests: year.guests, setup, energy, renew, payback, cross, gap: str[HORIZON_MONTHS] - lt[HORIZON_MONTHS] };
};

export type FiveYear = NonNullable<ReturnType<typeof fiveYear>>;
