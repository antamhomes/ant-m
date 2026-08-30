import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { SIZE_PRESET, type LocationKey, type SizeKey, type SeasonKey } from "@/lib/yield";

/**
 * Sdílený stav kalkulačky (lokalita, dispozice, plocha, sezóna, vybavení).
 * Tři vstupy (patch 140): kapacita se z dispozice a plochy odvodí (guestsFor),
 * majitel ji nezadává; plocha řídí nájem a může přidat hosty.
 * Čte ho CalculatorSection (měsíční odhad) i HorizonSection (pětiletý graf),
 * takže graf vždy počítá se stejným bytem, jaký si člověk nastavil v kalkulačce,
 * a čísla se nemůžou rozejít (audit 28. 8., nález 8).
 */
export type CalcLoc = LocationKey | "jinde";
export type Furn = "airbnb" | "najem" | "prazdny";

export const CALC_LOCATIONS: CalcLoc[] = [
  "praha1", "praha2", "praha3", "praha4", "praha5",
  "praha6", "praha7", "praha8", "praha9", "praha10", "jinde",
];
const SIZES: SizeKey[] = ["1kk", "2kk", "3kk", "4kk"];
const SEASONS: SeasonKey[] = ["year", "summer", "winter", "xmas"];

type CalcState = {
  location: CalcLoc; setLocation: (v: CalcLoc) => void;
  size: SizeKey; pickSize: (v: SizeKey) => void;
  m2: number; setM2: (v: number) => void;
  season: SeasonKey; setSeason: (v: SeasonKey) => void;
  furn: Furn; setFurn: (v: Furn) => void;
  /** true, když stránka přišla ze sdíleného odkazu ?byt=… */
  fromShare: boolean;
};

const CalcContext = createContext<CalcState | null>(null);

/** Sdílený odkaz (?byt=praha2-2kk-year-53m) otevře kalkulačku se stejným nastavením.
 *  Starší odkazy nesly ještě „6h“ (hosté) před plochou; ten díl se přeskočí. */
const readShare = () => {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("byt");
  if (!raw) return null;
  const [loc, sz, se, ...rest] = raw.split("-");
  const a = rest.find((x) => x.endsWith("m"));
  const m2 = a && Number.isFinite(+a.slice(0, -1)) ? +a.slice(0, -1) : null;
  return {
    location: CALC_LOCATIONS.some((l) => l === loc) ? (loc as CalcLoc) : null,
    size: SIZES.some((x) => x === sz) ? (sz as SizeKey) : null,
    season: se && SEASONS.includes(se as SeasonKey) ? (se as SeasonKey) : null,
    m2,
  };
};

export const CalcProvider = ({ children }: { children: ReactNode }) => {
  const initial = useMemo(readShare, []);
  const size0 = initial?.size ?? "2kk";
  const [location, setLocation] = useState<CalcLoc>(initial?.location ?? "praha1");
  const [size, setSize] = useState<SizeKey>(size0);
  const [m2, setM2] = useState<number>(initial?.m2 ?? SIZE_PRESET[size0].m2);
  const [season, setSeason] = useState<SeasonKey>(initial?.season ?? "year");
  const [furn, setFurn] = useState<Furn>("najem");
  const pickSize = (v: SizeKey) => { setSize(v); setM2(SIZE_PRESET[v].m2); };

  const value = useMemo<CalcState>(() => ({
    location, setLocation, size, pickSize, m2, setM2,
    season, setSeason, furn, setFurn, fromShare: initial !== null,
  }), [location, size, m2, season, furn, initial]);

  return <CalcContext.Provider value={value}>{children}</CalcContext.Provider>;
};

export const useCalc = () => {
  const ctx = useContext(CalcContext);
  if (!ctx) throw new Error("useCalc must be used inside CalcProvider");
  return ctx;
};
