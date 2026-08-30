import {
  ROOMS, ENERGY, ownerMonthly, rentFor,
  LAUNCH_FEE, KIT_PER_ROOM, EMPTY_PER_ROOM, RENEW_PER_ROOM_YEAR,
  YEAR_ONE_RAMP, PROJECT_FEE, PROJECT_FEE_THRESHOLD, RENT_GROWTH, STR_GROWTH,
  type LocationKey, type SizeKey,
} from "@/lib/yield";
import type { CalcLoc, Furn } from "@/contexts/CalcContext";

export const HORIZON_MONTHS = 60;

/**
 * Pětiletý průběh: STEJNÝ stav a STEJNÉ funkce jako měsíční odhad v kalkulačce
 * (ownerMonthly na výnos, rentFor na nájem). Od měsíčního čísla se odečítají
 * energie a obnova vybavení; obojí graf vypisuje, aby bylo vidět, proč se
 * pětileté číslo liší od měsíčního. Vrací null pro lokality bez dat.
 * Křivka `str` = střed rozpětí (hlavní číslo kalkulačky), `strMarket` a
 * `strHigh` = spodek (průměr trhu) a vršek (s Antam) téhož rozpětí; všechny
 * z téhož ownerMonthly, stejné energie, obnova i start. Graf kreslí pás.
 */
export const fiveYear = (location: CalcLoc, size: SizeKey, m2: number, furn: Furn) => {
  if (location === "jinde") return null;
  const year = ownerMonthly(location, size, { m2 });
  if (!year.supported) return null;
  const net = year.mid;
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
  const rent = rentFor(location as LocationKey, size, m2);
  const kit =
    furn === "prazdny" ? EMPTY_PER_ROOM * ROOMS[size]
    : furn === "najem" ? KIT_PER_ROOM * ROOMS[size]
    : 0;
  const projectFee = kit > PROJECT_FEE_THRESHOLD ? Math.round(kit * PROJECT_FEE) : 0;
  const setup = LAUNCH_FEE + kit + projectFee;
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
  return { lt, str, strMarket, strHigh, rent, y2, net, netMarket, netHigh, guests: year.guests, setup, kit, projectFee, energy, renew, payback, cross, gap: str[HORIZON_MONTHS] - lt[HORIZON_MONTHS] };
};

export type FiveYear = NonNullable<ReturnType<typeof fiveYear>>;
