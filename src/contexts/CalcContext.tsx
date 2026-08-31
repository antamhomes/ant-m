import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { typicalArea, ctvrtiOf, MARKET_CTVRT, bucketFor, bucketById, CALC_MODEL_VERSION, type LocationKey, type SizeKey, type SeasonKey } from "@/lib/yield";

/**
 * Sdílený stav kalkulačky (lokalita, čtvrť, dispozice, velikost, sezóna).
 * Plocha UŽ NENÍ vstup: majitel vybírá kbelík velikosti a m² z něj plynou
 * (viz níž). Plocha přitom pořád rozhoduje, jestli se 2+kk počítá jako 1BR
 * nebo 2BR produkt (Mozart 40 m² pro čtyři vs. Čelakovského 52 m² pro osm),
 * a jde rovnou do nájmu — jen se na ni veřejně neptáme na metr přesně.
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
  /** id vybraného kbelíku velikosti ("s" | "m" | "l" | "xl") */
  bucket: string; pickBucket: (id: string) => void;
  /** reprezentativní plocha vybraného kbelíku; u "xl" zůstává poslední platná */
  m2: number;
  /** true = byt nad p95 stocku, číslo se neextrapoluje a jde se na posouzení */
  oversized: boolean;
  /** verze konfigurace, pod kterou se to počítalo; jde do leadu */
  modelVersion: string;
  season: SeasonKey; setSeason: (v: SeasonKey) => void;
  /** true, když stránka přišla ze sdíleného odkazu ?byt=… */
  fromShare: boolean;
};

const CalcContext = createContext<CalcState | null>(null);

/** Sdílený odkaz otevře kalkulačku se stejným nastavením. Formát od 31. 8. 2026:
 *  ?byt=praha1-stare_mesto-2kk-52m-year, čtvrť „-“ znamená „Ostatní Praha X“.
 *  Starší odkazy (praha2-2kk-year, případně s hosty „6h“) se přečtou taky.
 *
 *  Čtvrť má TŘI hodnoty a odkaz musí rozlišit všechny tři:
 *    - id čtvrti  = vybraná čtvrť
 *    - null       = VĚDOMÁ volba „Ostatní Praha X“ (v odkazu prázdný slot „-“)
 *    - undefined  = krok „Upřesněte lokalitu“ nezodpovězen
 *  Do 1. 9. 2026 se null i undefined vracely stejně a `?? undefined` u useState
 *  je pak srovnalo na undefined, takže sdílený PLATNÝ výsledek Prahy 1
 *  s „Ostatní“ se příjemci otevřel jako „Vyberte prosím lokalitu“.
 *
 *  Čistá funkce (bere raw hodnotu `byt`), aby šla otestovat bez DOM. */
export const parseShare = (raw: string | null) => {
  if (!raw) return null;
  const parts = raw.split("-");
  const loc = parts.find((p) => CALC_LOCATIONS.some((l) => l === p)) ?? null;
  const size = parts.find((p) => SIZES.some((x) => x === p)) ?? null;
  const season = parts.find((p) => SEASONS.includes(p as SeasonKey)) ?? null;
  // hasOwn, ne `in`: `in` chytá i zděděné klíče z Object.prototype, takže
  // ?byt=praha1-constructor-… prošlo jako platná čtvrť a spadlo to až
  // v ownerMonthly na `MARKET_CTVRT["constructor"].parents` (undefined
  // .includes). Stránka neměla error boundary, takže bílá obrazovka.
  const found = parts.find((p) => Object.hasOwn(MARKET_CTVRT, p));
  // Prázdný slot vzniká jen z `${ctvrt ?? "-"}`, tedy z odkazu, který čtvrť
  // VĚDOMĚ vynechal. Starý odkaz bez slotu (praha2-2kk-year) zůstává
  // nezodpovězený, jak byl.
  const ctvrt: string | null | undefined =
    found ?? (parts.some((p) => p === "") ? null : undefined);
  const m2raw = parts.find((p) => /^\d{2,3}m$/.test(p));
  return {
    location: loc as CalcLoc | null,
    ctvrt,
    size: size as SizeKey | null,
    season: season as SeasonKey | null,
    m2: m2raw ? Number(m2raw.slice(0, -1)) : null,
  };
};

const readShare = () =>
  typeof window === "undefined"
    ? null
    : parseShare(new URLSearchParams(window.location.search).get("byt"));

export const CalcProvider = ({ children }: { children: ReactNode }) => {
  const initial = useMemo(readShare, []);
  const size0 = initial?.size ?? "2kk";
  const loc0 = initial?.location ?? "praha1";
  const [location, setLocationRaw] = useState<CalcLoc>(loc0);
  // POZOR: ne `initial?.ctvrt ?? undefined` — `??` srovná null na undefined,
  // a tím zmizí rozdíl mezi „Ostatní Praha X“ a „nezodpovězeno“.
  const [ctvrt, setCtvrt] = useState<string | null | undefined>(initial ? initial.ctvrt : undefined);
  const [size, setSize] = useState<SizeKey>(size0);
  const [bucket, setBucket] = useState<string>(bucketFor(size0, initial?.m2 ?? typicalArea(loc0, size0)).id);
  const [season, setSeason] = useState<SeasonKey>(initial?.season ?? "year");

  // m² už není vstup: plyne z vybraného kbelíku. Sdílené odkazy se ale pořád
  // nesou v m², takže se při načtení namapují na kbelík, který je obsahuje.
  const picked = bucketById(size, bucket);
  const oversized = picked.representativeM2 === null;
  const m2 = picked.representativeM2 ?? typicalArea(location, size);

  const needsCtvrt = ctvrtiOf(location).length > 0;
  /** Změna okresu vrací krok 2 na „nezodpovězeno“ a plochu na typickou pro nový okres. */
  const setLocation = (v: CalcLoc) => {
    setLocationRaw(v);
    setCtvrt(undefined);
    setBucket(bucketFor(size, typicalArea(v, size)).id);
  };
  /** Změna dispozice vybere kbelík, do kterého padne typická plocha té dispozice. */
  const pickSize = (v: SizeKey) => { setSize(v); setBucket(bucketFor(v, typicalArea(location, v)).id); };

  const value = useMemo<CalcState>(() => ({
    location, setLocation, ctvrt, setCtvrt, needsCtvrt,
    size, pickSize, bucket, pickBucket: setBucket, m2, oversized,
    modelVersion: CALC_MODEL_VERSION,
    season, setSeason, fromShare: initial !== null,
  }), [location, ctvrt, needsCtvrt, size, bucket, m2, oversized, season, initial]);

  return <CalcContext.Provider value={value}>{children}</CalcContext.Provider>;
};

export const useCalc = () => {
  const ctx = useContext(CalcContext);
  if (!ctx) throw new Error("useCalc must be used inside CalcProvider");
  return ctx;
};
