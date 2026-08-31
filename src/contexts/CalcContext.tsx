import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { typicalArea, ctvrtiOf, MARKET_CTVRT, type LocationKey, type SizeKey, type SeasonKey } from "@/lib/yield";

/**
 * Sdílený stav kalkulačky (lokalita, čtvrť, dispozice, plocha, sezóna).
 * Od 31. 8. 2026 jsou vstupy čtyři a plocha je mezi nimi zpátky: rozhoduje
 * o tom, jestli se 2+kk počítá jako 1BR nebo 2BR produkt (Mozart 40 m² pro
 * čtyři vs. Čelakovského 52 m² pro osm), a jde rovnou do nájmu.
 * Čtvrť je nepovinná: nabídne se jen tam, kde pro ni jsou data (ctvrtiOf),
 * jinak se počítá okres. Stav má tři hodnoty, aby „ještě nevybráno“ nebylo
 * totéž co „Ostatní Praha X“.
 * Čte ho CalculatorSection (měsíční odhad) i HorizonSection (pětiletý graf),
 * takže graf vždy počítá se stejným bytem, jaký si člověk nastavil v kalkulačce,
 * a čísla se nemůžou rozejít (audit 28. 8., nález 8).
 */
export type CalcLoc = LocationKey | "jinde";

export const CALC_LOCATIONS: CalcLoc[] = [
  "praha1", "praha2", "praha3", "praha4", "praha5",
  "praha6", "praha7", "praha8", "praha9", "praha10", "jinde",
];
const SIZES: SizeKey[] = ["1kk", "2kk", "3kk", "4kk"];
const SEASONS: SeasonKey[] = ["year", "summer", "winter", "xmas"];

type CalcState = {
  location: CalcLoc; setLocation: (v: CalcLoc) => void;
  /** undefined = krok „Upřesněte lokalitu“ nezodpovězen, null = Ostatní Praha X */
  ctvrt: string | null | undefined; setCtvrt: (v: string | null | undefined) => void;
  /** true, když okres má vlastní čtvrti, a krok se tedy nesmí přeskočit */
  needsCtvrt: boolean;
  size: SizeKey; pickSize: (v: SizeKey) => void;
  m2: number; setM2: (v: number) => void;
  season: SeasonKey; setSeason: (v: SeasonKey) => void;
  /** true, když stránka přišla ze sdíleného odkazu ?byt=… */
  fromShare: boolean;
};

const CalcContext = createContext<CalcState | null>(null);

/** Sdílený odkaz otevře kalkulačku se stejným nastavením. Formát od 31. 8. 2026:
 *  ?byt=praha1-stare_mesto-2kk-52m-year, čtvrť „-“ znamená okres. Starší odkazy
 *  (praha2-2kk-year, případně s hosty „6h“) se přečtou taky. */
const readShare = () => {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("byt");
  if (!raw) return null;
  const parts = raw.split("-");
  const loc = parts.find((p) => CALC_LOCATIONS.some((l) => l === p)) ?? null;
  const size = parts.find((p) => SIZES.some((x) => x === p)) ?? null;
  const season = parts.find((p) => SEASONS.includes(p as SeasonKey)) ?? null;
  const ctvrt = parts.find((p) => p in MARKET_CTVRT) ?? null;
  const m2raw = parts.find((p) => /^\d{2,3}m$/.test(p));
  return {
    location: loc as CalcLoc | null,
    ctvrt,
    size: size as SizeKey | null,
    season: season as SeasonKey | null,
    m2: m2raw ? Number(m2raw.slice(0, -1)) : null,
  };
};

export const CalcProvider = ({ children }: { children: ReactNode }) => {
  const initial = useMemo(readShare, []);
  const size0 = initial?.size ?? "2kk";
  const loc0 = initial?.location ?? "praha1";
  const [location, setLocationRaw] = useState<CalcLoc>(loc0);
  const [ctvrt, setCtvrt] = useState<string | null | undefined>(initial?.ctvrt ?? undefined);
  const [size, setSize] = useState<SizeKey>(size0);
  const [m2, setM2] = useState<number>(initial?.m2 ?? typicalArea(loc0, size0));
  const [season, setSeason] = useState<SeasonKey>(initial?.season ?? "year");

  const needsCtvrt = ctvrtiOf(location).length > 0;
  /** Změna okresu vrací krok 2 na „nezodpovězeno“ a plochu na typickou pro nový okres. */
  const setLocation = (v: CalcLoc) => {
    setLocationRaw(v);
    setCtvrt(undefined);
    setM2(typicalArea(v, size));
  };
  /** Změna dispozice přenastaví plochu na typickou pro tu dispozici. */
  const pickSize = (v: SizeKey) => { setSize(v); setM2(typicalArea(location, v)); };

  const value = useMemo<CalcState>(() => ({
    location, setLocation, ctvrt, setCtvrt, needsCtvrt,
    size, pickSize, m2, setM2,
    season, setSeason, fromShare: initial !== null,
  }), [location, ctvrt, needsCtvrt, size, m2, season, initial]);

  return <CalcContext.Provider value={value}>{children}</CalcContext.Provider>;
};

export const useCalc = () => {
  const ctx = useContext(CalcContext);
  if (!ctx) throw new Error("useCalc must be used inside CalcProvider");
  return ctx;
};
